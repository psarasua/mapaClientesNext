import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import DatabaseAdapter from '../../../lib/database/adapter.js';
import { validateCreateClientData } from '../../../types/index.js';

// GET - Obtener todos los clientes
export async function GET(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const db = new DatabaseAdapter();
    const clients = await db.getAllClients();

    return NextResponse.json({
      success: true,
      clients,
      total: clients.length,
      database: db.getDatabaseInfo()
    });
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
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

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
      const db = new DatabaseAdapter();
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
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id, ...clientData } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de cliente requerido'
      }, { status: 400 });
    }

    try {
      const db = new DatabaseAdapter();
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
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

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
      const db = new DatabaseAdapter();
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
