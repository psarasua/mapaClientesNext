import { NextResponse } from 'next/server';
import { getSQLiteDB } from '../../../lib/database/sqlite.js';
import { validateCreateClientData } from '../../../types/index.js';

// GET - Obtener todos los clientes
export async function GET() {
  try {
    // Intentar obtener clientes de SQLite
    try {
      const db = getSQLiteDB();
      const clients = await db.getAllClients();

      // Si no hay clientes, crear datos iniciales
      if (clients.length === 0) {
        await db.seedInitialClients();
        const newClients = await db.getAllClients();
        
        return NextResponse.json({
          success: true,
          clients: newClients,
          total: newClients.length,
          source: 'SQLite (initialized)'
        });
      }

      return NextResponse.json({
        success: true,
        clients,
        total: clients.length,
        source: 'SQLite'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite, usando fallback:', sqliteError);
      
      // Fallback a datos estáticos si SQLite falla
      const fallbackClients = [
        {
          id: 1,
          codigoalternativo: 'CLI001',
          razonsocial: 'Supermercados Central S.A.',
          nombre: 'Supermercados Central',
          direccion: 'Av. Libertador 1234, Santiago',
          telefono: '+56 2 2555 0001',
          rut: '96.789.123-4',
          activo: 1,
          latitud: -33.4489,
          longitud: -70.6693
        },
        {
          id: 2,
          codigoalternativo: 'CLI002',
          razonsocial: 'Distribuidora Norte Ltda.',
          nombre: 'Distribuidora Norte',
          direccion: 'Calle Principal 567, Antofagasta',
          telefono: '+56 55 2444 0002',
          rut: '76.543.210-9',
          activo: 1,
          latitud: -23.6509,
          longitud: -70.3975
        }
      ];

      return NextResponse.json({
        success: true,
        clients: fallbackClients,
        total: fallbackClients.length,
        source: 'localStorage fallback'
      });
    }
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Crear nuevo cliente
export async function POST(request) {
  try {
    const clientData = await request.json();
    
    // Validar datos del cliente
    if (!validateCreateClientData(clientData)) {
      return NextResponse.json({
        success: false,
        error: 'Datos de cliente inválidos. El nombre es requerido.'
      }, { status: 400 });
    }

    try {
      const db = getSQLiteDB();
      const newClient = await db.createClient(clientData);
      
      return NextResponse.json({
        success: true,
        client: newClient,
        message: 'Cliente creado exitosamente'
      }, { status: 201 });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creando cliente:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Actualizar cliente existente
export async function PUT(request) {
  try {
    const { id, ...clientData } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de cliente requerido'
      }, { status: 400 });
    }

    try {
      const db = getSQLiteDB();
      const updatedClient = await db.updateClient(id, clientData);
      
      if (!updatedClient) {
        return NextResponse.json({
          success: false,
          error: 'Cliente no encontrado'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        client: updatedClient,
        message: 'Cliente actualizado exitosamente'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Eliminar cliente
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de cliente requerido'
      }, { status: 400 });
    }

    try {
      const db = getSQLiteDB();
      const deleted = await db.deleteClient(parseInt(id));
      
      if (!deleted) {
        return NextResponse.json({
          success: false,
          error: 'Cliente no encontrado'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
