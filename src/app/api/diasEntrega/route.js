import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import DatabaseAdapter from '../../../lib/database/adapter.js';
import { validateCreateDiaEntregaData } from '../../../types/index.js';

// GET - Obtener todos los días de entrega
export async function GET(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    // Intentar obtener días de entrega de SQLite
    try {
      const db = new DatabaseAdapter();
      const diasEntrega = await db.getAllDiasEntrega();

      // Si no hay días de entrega, retornar array vacío
      // (comentado para evitar auto-generación de datos)
      /*
      if (diasEntrega.length === 0) {
        await db.seedInitialDiasEntrega();
        const newDiasEntrega = await db.getAllDiasEntrega();
        
        return NextResponse.json({
          success: true,
          diasEntrega: newDiasEntrega,
          total: newDiasEntrega.length,
          source: 'SQLite (initialized)'
        });
      }
      */

      return NextResponse.json({
        success: true,
        diasEntrega,
        total: diasEntrega.length,
        source: 'SQLite'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite, usando fallback:', sqliteError);
      
      // Fallback a datos estáticos si SQLite falla
      const fallbackDiasEntrega = [
        {
          id: 1,
          descripcion: 'Lunes'
        },
        {
          id: 2,
          descripcion: 'Martes'
        },
        {
          id: 3,
          descripcion: 'Miércoles'
        },
        {
          id: 4,
          descripcion: 'Jueves'
        },
        {
          id: 5,
          descripcion: 'Viernes'
        }
      ];

      return NextResponse.json({
        success: true,
        diasEntrega: fallbackDiasEntrega,
        total: fallbackDiasEntrega.length,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Error obteniendo días de entrega:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Crear nuevo día de entrega
export async function POST(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const diaEntregaData = await request.json();
    
    // Validar datos del día de entrega
    if (!validateCreateDiaEntregaData(diaEntregaData)) {
      return NextResponse.json({
        success: false,
        error: 'Datos de día de entrega inválidos. La descripción es requerida.'
      }, { status: 400 });
    }

    try {
      const db = new DatabaseAdapter();
      const newDiaEntrega = await db.createDiaEntrega(diaEntregaData);
      
      return NextResponse.json({
        success: true,
        diaEntrega: newDiaEntrega,
        message: 'Día de entrega creado exitosamente'
      }, { status: 201 });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creando día de entrega:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Actualizar día de entrega existente
export async function PUT(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id, ...diaEntregaData } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de día de entrega requerido'
      }, { status: 400 });
    }

    try {
      const db = new DatabaseAdapter();
      const updatedDiaEntrega = await db.updateDiaEntrega(id, diaEntregaData);
      
      if (!updatedDiaEntrega) {
        return NextResponse.json({
          success: false,
          error: 'Día de entrega no encontrado'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        diaEntrega: updatedDiaEntrega,
        message: 'Día de entrega actualizado exitosamente'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error actualizando día de entrega:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Eliminar día de entrega
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
        error: 'ID de día de entrega requerido'
      }, { status: 400 });
    }

    try {
      const db = new DatabaseAdapter();
      const deleted = await db.deleteDiaEntrega(parseInt(id));
      
      if (!deleted) {
        return NextResponse.json({
          success: false,
          error: 'Día de entrega no encontrado'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Día de entrega eliminado exitosamente'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error eliminando día de entrega:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
