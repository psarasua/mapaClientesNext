import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import { diaEntregaService } from '../../../lib/dbServices.js';
import { validateCreateDiaEntregaData } from '../../../types/index.js';

// GET - Obtener todos los días de entrega
export async function GET(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const diasEntrega = await diaEntregaService.getAll();

    return NextResponse.json({
      success: true,
      diasEntrega,
      total: diasEntrega.length
    });
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
      const newDiaEntrega = await prisma.diaEntrega.create({
        data: diaEntregaData
      });
      
      return NextResponse.json({
        success: true,
        diaEntrega: newDiaEntrega,
        message: 'Día de entrega creado exitosamente'
      }, { status: 201 });
    } catch (dbError) {
      console.error('Error creando día de entrega:', dbError);
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
      const updatedDiaEntrega = await prisma.diaEntrega.update({
        where: { id: parseInt(id) },
        data: diaEntregaData
      });
      
      return NextResponse.json({
        success: true,
        diaEntrega: updatedDiaEntrega,
        message: 'Día de entrega actualizado exitosamente'
      });
    } catch (dbError) {
      if (dbError.code === 'P2025') {
        return NextResponse.json({
          success: false,
          error: 'Día de entrega no encontrado'
        }, { status: 404 });
      }
      
      console.error('Error actualizando día de entrega:', dbError);
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
      await prisma.diaEntrega.delete({
        where: { id: parseInt(id) }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Día de entrega eliminado exitosamente'
      });
    } catch (dbError) {
      if (dbError.code === 'P2025') {
        return NextResponse.json({
          success: false,
          error: 'Día de entrega no encontrado'
        }, { status: 404 });
      }
      
      console.error('Error eliminando día de entrega:', dbError);
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
