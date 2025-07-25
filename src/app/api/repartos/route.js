import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import DatabaseAdapter from '../../../lib/database/adapter.js';
import { validateCreateRepartoData } from '../../../types/index.js';

// GET - Obtener todos los repartos
export async function GET(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const dia = searchParams.get('dia');
    const camion = searchParams.get('camion');

    try {
      const db = new DatabaseAdapter();
      let repartos;

      if (dia) {
        // Obtener repartos por día específico
        repartos = await db.getRepartosByDia(parseInt(dia));
      } else if (camion) {
        // Obtener repartos por camión específico
        repartos = await db.getRepartosByCamion(parseInt(camion));
      } else {
        // Obtener todos los repartos
        repartos = await db.getAllRepartos();
      }

      // Si no hay repartos, retornar array vacío
      // (comentado para evitar auto-generación de datos)
      /*
      if (repartos.length === 0 && !dia && !camion) {
        await db.seedInitialRepartos();
        const newRepartos = await db.getAllRepartos();
        
        return NextResponse.json({
          success: true,
          repartos: newRepartos,
          total: newRepartos.length,
          source: 'SQLite (initialized)'
        });
      }
      */

      return NextResponse.json({
        success: true,
        repartos,
        total: repartos.length,
        source: 'SQLite'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite, usando fallback:', sqliteError);
      
      // Fallback a datos estáticos si SQLite falla
      const fallbackRepartos = [
        {
          id: 1,
          diasEntrega_id: 1,
          camion_id: 1,
          dia_descripcion: 'Lunes',
          camion_descripcion: 'Camión de Reparto Principal'
        },
        {
          id: 2,
          diasEntrega_id: 2,
          camion_id: 1,
          dia_descripcion: 'Martes',
          camion_descripcion: 'Camión de Reparto Principal'
        }
      ];

      return NextResponse.json({
        success: true,
        repartos: fallbackRepartos,
        total: fallbackRepartos.length,
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Error obteniendo repartos:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Crear nuevo reparto
export async function POST(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const repartoData = await request.json();
    
    // Validar datos del reparto
    if (!validateCreateRepartoData(repartoData)) {
      return NextResponse.json({
        success: false,
        error: 'Datos de reparto inválidos. El ID de día de entrega y ID de camión son requeridos.'
      }, { status: 400 });
    }

    try {
      const db = new DatabaseAdapter();
      const newReparto = await db.createReparto(repartoData);
      
      return NextResponse.json({
        success: true,
        reparto: newReparto,
        message: 'Reparto creado exitosamente'
      }, { status: 201 });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      
      // Verificar si es un error de duplicado
      if (sqliteError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json({
          success: false,
          error: 'Ya existe un reparto para este camión en este día'
        }, { status: 409 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creando reparto:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Actualizar reparto existente
export async function PUT(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id, ...repartoData } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de reparto requerido'
      }, { status: 400 });
    }

    try {
      const db = new DatabaseAdapter();
      const updatedReparto = await db.updateReparto(id, repartoData);
      
      if (!updatedReparto) {
        return NextResponse.json({
          success: false,
          error: 'Reparto no encontrado'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        reparto: updatedReparto,
        message: 'Reparto actualizado exitosamente'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      
      // Verificar si es un error de duplicado
      if (sqliteError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json({
          success: false,
          error: 'Ya existe un reparto para este camión en este día'
        }, { status: 409 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error actualizando reparto:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Eliminar reparto
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
        error: 'ID de reparto requerido'
      }, { status: 400 });
    }

    try {
      const db = new DatabaseAdapter();
      const deleted = await db.deleteReparto(parseInt(id));
      
      if (!deleted) {
        return NextResponse.json({
          success: false,
          error: 'Reparto no encontrado'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Reparto eliminado exitosamente'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite:', sqliteError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error eliminando reparto:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
