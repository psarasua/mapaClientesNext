import { NextResponse } from 'next/server';
import DatabaseAdapter from '@/lib/database/adapter';
import { validateCreateClienteporRepartoData } from '../../../types/index.js';

// GET - Obtener todos los clientes por reparto
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reparto = searchParams.get('reparto');
    const cliente = searchParams.get('cliente');

    try {
      const db = new DatabaseAdapter();
      let clientesporReparto;

      if (reparto) {
        // Obtener clientes por reparto específico
        clientesporReparto = await db.getClientesporRepartoByReparto(parseInt(reparto));
      } else if (cliente) {
        // Obtener repartos por cliente específico
        clientesporReparto = await db.getClientesporRepartoByCliente(parseInt(cliente));
      } else {
        // Obtener todas las asignaciones
        clientesporReparto = await db.getAllClientesporReparto();
      }

      // Si no hay asignaciones, crear datos iniciales
      if (clientesporReparto.length === 0 && !reparto && !cliente) {
        await db.seedInitialClientesporReparto();
        const newClientesporReparto = await db.getAllClientesporReparto();
        
        return NextResponse.json({
          success: true,
          clientesporReparto: newClientesporReparto,
          total: newClientesporReparto.length,
          source: 'SQLite (initialized)'
        });
      }

      return NextResponse.json({
        success: true,
        clientesporReparto,
        total: clientesporReparto.length,
        source: 'SQLite'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite, usando fallback:', sqliteError);
      
      // Fallback a datos estáticos si SQLite falla
      const fallbackClientesporReparto = [
        {
          id: 1,
          reparto_id: 1,
          cliente_id: 1,
          dia_descripcion: 'Lunes',
          camion_descripcion: 'Camión de Reparto Principal',
          cliente_nombre: 'Supermercados Central'
        },
        {
          id: 2,
          reparto_id: 1,
          cliente_id: 2,
          dia_descripcion: 'Lunes',
          camion_descripcion: 'Camión de Reparto Principal',
          cliente_nombre: 'Distribuidora Norte'
        }
      ];

      return NextResponse.json({
        success: true,
        clientesporReparto: fallbackClientesporReparto,
        total: fallbackClientesporReparto.length,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Error obteniendo clientes por reparto:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Crear nueva asignación cliente-reparto
export async function POST(request) {
  try {
    const clienteRepartoData = await request.json();
    
    // Validar datos de la asignación
    if (!validateCreateClienteporRepartoData(clienteRepartoData)) {
      return NextResponse.json({
        success: false,
        error: 'Datos de asignación inválidos. El ID de reparto y ID de cliente son requeridos.'
      }, { status: 400 });
    }

    try {
      const db = new DatabaseAdapter();
      const newClienteporReparto = await db.createClienteporReparto(clienteRepartoData);
      
      return NextResponse.json({
        success: true,
        clienteporReparto: newClienteporReparto,
        message: 'Cliente asignado al reparto exitosamente'
      }, { status: 201 });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      
      // Verificar si es un error de duplicado
      if (sqliteError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json({
          success: false,
          error: 'Este cliente ya está asignado a este reparto'
        }, { status: 409 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creando asignación cliente-reparto:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Actualizar asignación cliente-reparto existente
export async function PUT(request) {
  try {
    const { id, ...clienteRepartoData } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de asignación requerido'
      }, { status: 400 });
    }

    try {
      const db = new DatabaseAdapter();
      const updatedClienteporReparto = await db.updateClienteporReparto(id, clienteRepartoData);
      
      if (!updatedClienteporReparto) {
        return NextResponse.json({
          success: false,
          error: 'Asignación no encontrada'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        clienteporReparto: updatedClienteporReparto,
        message: 'Asignación actualizada exitosamente'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      
      // Verificar si es un error de duplicado
      if (sqliteError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json({
          success: false,
          error: 'Este cliente ya está asignado a este reparto'
        }, { status: 409 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error actualizando asignación cliente-reparto:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Eliminar asignación cliente-reparto
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de asignación requerido'
      }, { status: 400 });
    }

    try {
      const db = new DatabaseAdapter();
      const deleted = await db.deleteClienteporReparto(parseInt(id));
      
      if (!deleted) {
        return NextResponse.json({
          success: false,
          error: 'Asignación no encontrada'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Asignación eliminada exitosamente'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error eliminando asignación cliente-reparto:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
