import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import { prisma } from '../../../lib/prisma.js';
import { validateCreateClienteporRepartoData } from '../../../types/index.js';

// GET - Obtener todos los clientes por reparto
export async function GET(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const reparto = searchParams.get('reparto');
    const cliente = searchParams.get('cliente');

    let whereClause = {};
    
    if (reparto) {
      whereClause.reparto_id = parseInt(reparto);
    }
    if (cliente) {
      whereClause.cliente_id = parseInt(cliente);
    }

    const clientesporReparto = await prisma.clienteporReparto.findMany({
      where: whereClause,
      include: {
        reparto: {
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
        },
        cliente: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Transformar datos para mantener compatibilidad
    const formattedClientesporReparto = clientesporReparto.map(item => ({
      ...item,
      dia_descripcion: item.reparto?.diaEntrega?.descripcion,
      camion_descripcion: item.reparto?.camion?.description,
      cliente_nombre: item.cliente?.nombre
    }));

    return NextResponse.json({
      success: true,
      clientesporReparto: formattedClientesporReparto,
      total: formattedClientesporReparto.length
    });
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
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

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
      const newClienteporReparto = await prisma.clienteporReparto.create({
        data: clienteRepartoData,
        include: {
          reparto: {
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
          },
          cliente: {
            select: {
              nombre: true
            }
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        clienteporReparto: {
          ...newClienteporReparto,
          dia_descripcion: newClienteporReparto.reparto?.diaEntrega?.descripcion,
          camion_descripcion: newClienteporReparto.reparto?.camion?.description,
          cliente_nombre: newClienteporReparto.cliente?.nombre
        },
        message: 'Cliente asignado al reparto exitosamente'
      }, { status: 201 });
    } catch (dbError) {
      if (dbError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'Este cliente ya está asignado a este reparto'
        }, { status: 409 });
      }
      
      console.error('Error creando asignación:', dbError);
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
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id, ...clienteRepartoData } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de asignación requerido'
      }, { status: 400 });
    }

    try {
      const updatedClienteporReparto = await prisma.clienteporReparto.update({
        where: { id: parseInt(id) },
        data: clienteRepartoData,
        include: {
          reparto: {
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
          },
          cliente: {
            select: {
              nombre: true
            }
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        clienteporReparto: {
          ...updatedClienteporReparto,
          dia_descripcion: updatedClienteporReparto.reparto?.diaEntrega?.descripcion,
          camion_descripcion: updatedClienteporReparto.reparto?.camion?.description,
          cliente_nombre: updatedClienteporReparto.cliente?.nombre
        },
        message: 'Asignación actualizada exitosamente'
      });
    } catch (dbError) {
      if (dbError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'Este cliente ya está asignado a este reparto'
        }, { status: 409 });
      }
      if (dbError.code === 'P2025') {
        return NextResponse.json({
          success: false,
          error: 'Asignación no encontrada'
        }, { status: 404 });
      }
      
      console.error('Error actualizando asignación:', dbError);
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
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

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
      await prisma.clienteporReparto.delete({
        where: { id: parseInt(id) }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Asignación eliminada exitosamente'
      });
    } catch (dbError) {
      if (dbError.code === 'P2025') {
        return NextResponse.json({
          success: false,
          error: 'Asignación no encontrada'
        }, { status: 404 });
      }
      
      console.error('Error eliminando asignación:', dbError);
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
