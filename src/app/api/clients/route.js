import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import { clientService } from '../../../lib/dbServices.js';
import { validateCreateClientData } from '../../../types/index.js';

// GET - Obtener todos los clientes
export async function GET(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const clients = await clientService.getAll();

    return NextResponse.json({
      success: true,
      clients,
      total: clients.length
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

    const newClient = await prisma.client.create({
      data: clientData
    });
    
    return NextResponse.json({
      success: true,
      client: newClient,
      message: 'Cliente creado exitosamente'
    }, { status: 201 });

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

    const updatedClient = await prisma.client.update({
      where: { id: parseInt(id) },
      data: clientData
    });
    
    return NextResponse.json({
      success: true,
      client: updatedClient,
      message: 'Cliente actualizado exitosamente'
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Cliente no encontrado'
      }, { status: 404 });
    }
    
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

    await prisma.client.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Cliente no encontrado'
      }, { status: 404 });
    }
    
    console.error('Error eliminando cliente:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
