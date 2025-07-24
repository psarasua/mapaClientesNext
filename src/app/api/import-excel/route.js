import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import * as XLSX from 'xlsx';
import DatabaseAdapter from '../../../lib/database/adapter.js';

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

    // Conectar a la base de datos
    const db = new DatabaseAdapter();
    await db.init();

    let importedCount = 0;
    let errors = [];

    // Procesar según el tipo de tabla
    switch (tableType) {
      case 'clients':
        const clientResults = await importClients(db, jsonData, replaceData);
        importedCount = clientResults.imported;
        errors = clientResults.errors;
        break;
        
      case 'trucks':
        const truckResults = await importTrucks(db, jsonData, replaceData);
        importedCount = truckResults.imported;
        errors = truckResults.errors;
        break;
        
      case 'repartos':
        const repartoResults = await importRepartos(db, jsonData, replaceData);
        importedCount = repartoResults.imported;
        errors = repartoResults.errors;
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: `Tipo de tabla no soportado: ${tableType}`
        }, { status: 400 });
    }

    console.log(`🔍 [IMPORT] Importación completada: ${importedCount} registros`);

    return NextResponse.json({
      success: true,
      message: `Importación completada exitosamente`,
      imported: importedCount,
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
async function importClients(db, data, replaceData = false) {
  let imported = 0;
  const errors = [];

  // Si se debe reemplazar, limpiar datos existentes
  if (replaceData) {
    try {
      console.log('🗑️ [IMPORT] Eliminando todos los clientes existentes...');
      await db.clearAllClients();
      console.log('✅ [IMPORT] Clientes existentes eliminados');
    } catch (error) {
      console.error('❌ [IMPORT] Error eliminando clientes:', error);
      errors.push(`Error eliminando datos existentes: ${error.message}`);
    }
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      // Mapear columnas del Excel a campos de la BD
      const client = {
        Codigo: row['Codigo'] || row['codigo'] || row['CODIGO'] || '',
        Razon: row['Razon'] || row['razon'] || row['RazonSocial'] || row['razonSocial'] || row['RAZON_SOCIAL'] || '',
        Nombre: row['Nombre'] || row['nombre'] || row['NOMBRE'] || row['Razon'] || row['razon'] || '',
        Direccion: row['Direccion'] || row['direccion'] || row['DIRECCION'] || '',
        Telefono1: row['Telefono1'] || row['telefono1'] || row['telefono'] || row['Telefono'] || row['TELEFONO'] || '',
        Ruc: row['Ruc'] || row['ruc'] || row['RUC'] || row['rut'] || row['RUT'] || '',
        Activo: parseInt(row['Activo'] || row['activo'] || row['ACTIVO'] || '1'),
        Coordenada_x: parseFloat(row['Coordenada_x'] || row['coordenada_x'] || row['lng'] || row['longitud'] || row['longitude'] || 0) || null,
        Coordenada_y: parseFloat(row['Coordenada_y'] || row['coordenada_y'] || row['lat'] || row['latitud'] || row['latitude'] || 0) || null
      };

      // Validar campos requeridos
      if (!client.Codigo?.trim()) {
        errors.push(`Fila ${i + 2}: Código es requerido`);
        continue;
      }
      if (!client.Nombre?.trim()) {
        errors.push(`Fila ${i + 2}: Nombre es requerido`);
        continue;
      }

      await db.createClient(client);
      imported++;
    } catch (error) {
      errors.push(`Fila ${i + 2}: ${error.message}`);
    }
  }

  return { imported, errors };
}

// Función para importar camiones
async function importTrucks(db, data, replaceData = false) {
  let imported = 0;
  const errors = [];

  // Si se debe reemplazar, limpiar datos existentes
  if (replaceData) {
    try {
      console.log('🗑️ [IMPORT] Eliminando todos los camiones existentes...');
      await db.clearAllTrucks(); // Necesitaremos implementar esta función
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

      await db.createTruck(truck);
      imported++;
    } catch (error) {
      errors.push(`Fila ${i + 2}: ${error.message}`);
    }
  }

  return { imported, errors };
}

// Función para importar repartos
async function importRepartos(db, data, replaceData = false) {
  let imported = 0;
  const errors = [];

  // Si se debe reemplazar, limpiar datos existentes
  if (replaceData) {
    try {
      console.log('🗑️ [IMPORT] Eliminando todos los repartos existentes...');
      await db.clearAllRepartos(); // Necesitaremos implementar esta función
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

      await db.createReparto(reparto);
      imported++;
    } catch (error) {
      errors.push(`Fila ${i + 2}: ${error.message}`);
    }
  }

  return { imported, errors };
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
