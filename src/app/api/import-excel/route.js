import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import * as XLSX from 'xlsx';
import { 
  userService, 
  clientService, 
  truckService, 
  repartoService, 
  diaEntregaService 
} from '../../../lib/dbServices.js';

// Configurar runtime para compatibilidad
export const runtime = 'nodejs';

export async function POST(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    console.log('🔍 [IMPORT] Iniciando importación de Excel...');
    
    const formData = await request.formData();
    const file = formData.get('file');
    const tableType = formData.get('tableType'); // 'clients', 'trucks', 'users', etc.
    const replaceData = formData.get('replaceData') === 'true'; // true = reemplazar, false = agregar
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No se ha seleccionado ningún archivo'
      }, { status: 400 });
    }
    
    if (!tableType) {
      return NextResponse.json({
        success: false,
        error: 'No se ha especificado el tipo de tabla'
      }, { status: 400 });
    }

    console.log(`🔍 [IMPORT] Archivo: ${file.name}, Tabla: ${tableType}`);

    // Leer el archivo Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`🔍 [IMPORT] ${jsonData.length} filas encontradas`);

    if (jsonData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'El archivo Excel está vacío o no tiene datos válidos'
      }, { status: 400 });
    }

    // Procesar según el tipo de tabla
    switch (tableType) {
      case 'clients':
        const clientResults = await importClients(jsonData, replaceData);
        importedCount = clientResults.imported;
        updatedCount = clientResults.updated;
        errors = clientResults.errors;
        break;
        
      case 'trucks':
        const truckResults = await importTrucks(jsonData, replaceData);
        importedCount = truckResults.imported;
        updatedCount = truckResults.updated || 0;
        errors = truckResults.errors;
        break;
        
      case 'repartos':
        const repartoResults = await importRepartos(jsonData, replaceData);
        importedCount = repartoResults.imported;
        updatedCount = repartoResults.updated || 0;
        errors = repartoResults.errors;
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: `Tipo de tabla no soportado: ${tableType}`
        }, { status: 400 });
    }

    console.log(`🔍 [IMPORT] Importación completada: ${importedCount} nuevos registros, ${updatedCount} actualizados`);

    return NextResponse.json({
      success: true,
      message: `Importación completada exitosamente`,
      imported: importedCount,
      updated: updatedCount,
      total: jsonData.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : [], // Solo primeros 10 errores
      hasMoreErrors: errors.length > 10
    });

  } catch (error) {
    console.error('🔍 [IMPORT] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error procesando el archivo',
      details: error.message
    }, { status: 500 });
  }
}

// Función para importar clientes
async function importClients(data, replaceData = false) {
  let imported = 0;
  let updated = 0;
  const errors = [];

  // Si se debe reemplazar, limpiar datos existentes
  if (replaceData) {
    try {
      console.log('🗑️ [IMPORT] Eliminando todos los clientes existentes...');
      await clientService.deleteAll();
      console.log('✅ [IMPORT] Clientes existentes eliminados');
    } catch (error) {
      console.error('❌ [IMPORT] Error eliminando clientes:', error);
      errors.push(`Error eliminando datos existentes: ${error.message}`);
    }
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      // Convertir todos los valores a string y limpiar
      const rawCodigo = row['Codigo'] || row['codigo'] || row['CODIGO'] || '';
      const rawRazon = row['Razon'] || row['razon'] || row['RazonSocial'] || row['razonSocial'] || row['RAZON_SOCIAL'] || '';
      const rawNombre = row['Nombre'] || row['nombre'] || row['NOMBRE'] || rawRazon || '';
      const rawDireccion = row['Direccion'] || row['direccion'] || row['DIRECCION'] || '';
      const rawTelefono = row['Telefono1'] || row['telefono1'] || row['telefono'] || row['Telefono'] || row['TELEFONO'] || '';
      const rawRuc = row['Ruc'] || row['ruc'] || row['RUC'] || row['rut'] || row['RUT'] || '';
      const rawActivo = row['Activo'] || row['activo'] || row['ACTIVO'] || '1';
      const rawCoordX = row['Coordenada_x'] || row['coordenada_x'] || row['lng'] || row['longitud'] || row['longitude'] || 0;
      const rawCoordY = row['Coordenada_y'] || row['coordenada_y'] || row['lat'] || row['latitud'] || row['latitude'] || 0;

      // Mapear columnas del Excel a campos de la BD
      const client = {
        Codigo: String(rawCodigo).trim(),
        Razon: String(rawRazon).trim(),
        Nombre: String(rawNombre).trim(),
        Direccion: String(rawDireccion).trim(),
        Telefono1: String(rawTelefono).trim(),
        Ruc: String(rawRuc).trim(),
        Activo: parseInt(rawActivo) || 1,
        Coordenada_x: parseFloat(rawCoordX) || null,
        Coordenada_y: parseFloat(rawCoordY) || null
      };

      // Validar campos requeridos
      if (!client.Codigo || client.Codigo.length === 0) {
        errors.push(`Fila ${i + 2}: Código es requerido`);
        continue;
      }
      if (!client.Nombre || client.Nombre.length === 0) {
        errors.push(`Fila ${i + 2}: Nombre es requerido`);
        continue;
      }

      // Validar longitud de campos
      if (client.Codigo.length > 50) {
        errors.push(`Fila ${i + 2}: Código demasiado largo (máximo 50 caracteres)`);
        continue;
      }
      if (client.Nombre.length > 255) {
        errors.push(`Fila ${i + 2}: Nombre demasiado largo (máximo 255 caracteres)`);
        continue;
      }

      // Verificar si el cliente ya existe (simplificado por ahora)
      try {
        await clientService.create(client);
        imported++;
      } catch (createError) {
        errors.push(`Fila ${i + 2}: Error creando cliente - ${createError.message}`);
      }
    } catch (error) {
      errors.push(`Fila ${i + 2}: ${error.message}`);
    }
  }

  return { imported, updated, errors };
}

// Función para importar camiones
async function importTrucks(data, replaceData = false) {
  let imported = 0;
  let updated = 0;
  const errors = [];

  // Si se debe reemplazar, limpiar datos existentes
  if (replaceData) {
    try {
      console.log('🗑️ [IMPORT] Eliminando todos los camiones existentes...');
      await truckService.deleteAll();
      console.log('✅ [IMPORT] Camiones existentes eliminados');
    } catch (error) {
      console.error('❌ [IMPORT] Error eliminando camiones:', error);
      errors.push(`Error eliminando datos existentes: ${error.message}`);
    }
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      const truck = {
        description: row['descripcion'] || row['Descripción'] || row['DESCRIPCION'] || 
                    row['Nombre'] || row['nombre'] || row['NOMBRE'] || ''
      };

      if (!truck.description.trim()) {
        errors.push(`Fila ${i + 2}: Descripción es requerida`);
        continue;
      }

      await truckService.create(truck);
      imported++;
    } catch (error) {
      errors.push(`Fila ${i + 2}: ${error.message}`);
    }
  }

  return { imported, updated, errors };
}

// Función para importar repartos
async function importRepartos(data, replaceData = false) {
  let imported = 0;
  let updated = 0;
  const errors = [];

  // Si se debe reemplazar, limpiar datos existentes
  if (replaceData) {
    try {
      console.log('🗑️ [IMPORT] Eliminando todos los repartos existentes...');
      await repartoService.deleteAll();
      console.log('✅ [IMPORT] Repartos existentes eliminados');
    } catch (error) {
      console.error('❌ [IMPORT] Error eliminando repartos:', error);
      errors.push(`Error eliminando datos existentes: ${error.message}`);
    }
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      const reparto = {
        nombre: row['nombre'] || row['Nombre'] || row['NOMBRE'] || '',
        descripcion: row['descripcion'] || row['Descripción'] || row['DESCRIPCION'] || '',
        color: row['color'] || row['Color'] || row['COLOR'] || '#007bff'
      };

      if (!reparto.nombre.trim()) {
        errors.push(`Fila ${i + 2}: Nombre es requerido`);
        continue;
      }

      await repartoService.create(reparto);
      imported++;
    } catch (error) {
      errors.push(`Fila ${i + 2}: ${error.message}`);
    }
  }

  return { imported, updated, errors };
}

export async function GET(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  return NextResponse.json({
    message: 'Endpoint de importación de Excel',
    supportedTables: ['clients', 'trucks', 'repartos'],
    expectedColumns: {
      clients: [
        'Código (opcional)',
        'Razón Social',
        'Dirección',
        'Teléfono',
        'Email',
        'Latitud (opcional)',
        'Longitud (opcional)',
        'Observaciones (opcional)'
      ],
      trucks: [
        'Descripción'
      ],
      repartos: [
        'Nombre',
        'Descripción (opcional)',
        'Color (opcional, formato hex)'
      ]
    }
  });
}
