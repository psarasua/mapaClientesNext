import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import { prisma } from '../../../lib/prisma.js';
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

    let whereClause = {};
    
    if (dia) {
      whereClause.diasEntrega_id = parseInt(dia);
    }
    if (camion) {
      whereClause.camion_id = parseInt(camion);
    }

    const repartos = await prisma.reparto.findMany({
      where: whereClause,
      include: {
        diaEntrega: {
          select: {
            descripcion: true
          }
        },
        camion: {
          select: {
            description: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Transformar los datos para mantener compatibilidad
    const formattedRepartos = repartos.map(reparto => ({
      ...reparto,
      dia_descripcion: reparto.diaEntrega?.descripcion,
      camion_descripcion: reparto.camion?.description
    }));

    return NextResponse.json({
      success: true,
      repartos: formattedRepartos,
      total: formattedRepartos.length
    });
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
      const newReparto = await prisma.reparto.create({
        data: repartoData,
        include: {
          diaEntrega: {
            select: {
              descripcion: true
            }
          },
          camion: {
            select: {
              description: true
            }
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        reparto: {
          ...newReparto,
          dia_descripcion: newReparto.diaEntrega?.descripcion,
          camion_descripcion: newReparto.camion?.description
        },
        message: 'Reparto creado exitosamente'
      }, { status: 201 });
    } catch (dbError) {
      if (dbError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'Ya existe un reparto para este camión en este día'
        }, { status: 409 });
      }
      
      console.error('Error creando reparto:', dbError);
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
      const updatedReparto = await prisma.reparto.update({
        where: { id: parseInt(id) },
        data: repartoData,
        include: {
          diaEntrega: {
            select: {
              descripcion: true
            }
          },
          camion: {
            select: {
              description: true
            }
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        reparto: {
          ...updatedReparto,
          dia_descripcion: updatedReparto.diaEntrega?.descripcion,
          camion_descripcion: updatedReparto.camion?.description
        },
        message: 'Reparto actualizado exitosamente'
      });
    } catch (dbError) {
      if (dbError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'Ya existe un reparto para este camión en este día'
        }, { status: 409 });
      }
      if (dbError.code === 'P2025') {
        return NextResponse.json({
          success: false,
          error: 'Reparto no encontrado'
        }, { status: 404 });
      }
      
      console.error('Error actualizando reparto:', dbError);
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
      await prisma.reparto.delete({
        where: { id: parseInt(id) }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Reparto eliminado exitosamente'
      });
    } catch (dbError) {
      if (dbError.code === 'P2025') {
        return NextResponse.json({
          success: false,
          error: 'Reparto no encontrado'
        }, { status: 404 });
      }
      
      console.error('Error eliminando reparto:', dbError);
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
