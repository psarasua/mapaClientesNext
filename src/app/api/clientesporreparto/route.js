import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import { clienteporRepartoService } from '../../../lib/services/clienteporRepartoService.js';
import { repartoService } from '../../../lib/services/repartoService.js';
import { clientService } from '../../../lib/services/clientService.js';
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

    // Obtener todas las asignaciones
    const clientesporReparto = await clienteporRepartoService.getAll();
    
    // Filtrar si se especifican parámetros
    let filteredData = clientesporReparto;
    if (reparto) {
      filteredData = filteredData.filter(item => item.reparto_id === parseInt(reparto));
    }
    if (cliente) {
      filteredData = filteredData.filter(item => item.cliente_id === parseInt(cliente));
    }

    // Para cada item, obtener los datos relacionados
    const formattedClientesporReparto = await Promise.all(
      filteredData.map(async (item) => {
        const reparto = await repartoService.getById(item.reparto_id);
        const cliente = await clientService.getById(item.cliente_id);
        
        return {
          ...item,
          reparto: reparto,
          cliente: cliente,
          dia_descripcion: reparto?.descripcion,
          cliente_nombre: cliente?.nombre
        };
      })
    );

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
      // Verificar si ya existe la asignación
      const existingAssignments = await clienteporRepartoService.getAll();
      const duplicateExists = existingAssignments.some(item => 
        item.cliente_id === clienteRepartoData.clientId && 
        item.reparto_id === clienteRepartoData.repartoId
      );

      if (duplicateExists) {
        return NextResponse.json({
          success: false,
          error: 'Este cliente ya está asignado a este reparto'
        }, { status: 409 });
      }

      const newClienteporReparto = await clienteporRepartoService.create(clienteRepartoData);
      
      // Obtener los datos relacionados para la respuesta
      const reparto = await repartoService.getById(newClienteporReparto.reparto_id);
      const cliente = await clientService.getById(newClienteporReparto.cliente_id);
      
      return NextResponse.json({
        success: true,
        clienteporReparto: {
          ...newClienteporReparto,
          reparto: reparto,
          cliente: cliente,
          dia_descripcion: reparto?.descripcion,
          cliente_nombre: cliente?.nombre
        },
        message: 'Cliente asignado al reparto exitosamente'
      }, { status: 201 });
    } catch (dbError) {
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
      const updatedClienteporReparto = await clienteporRepartoService.update(parseInt(id), clienteRepartoData);
      
      // Obtener los datos relacionados
      const reparto = await repartoService.getById(updatedClienteporReparto.reparto_id);
      const cliente = await clientService.getById(updatedClienteporReparto.cliente_id);
      
      return NextResponse.json({
        success: true,
        clienteporReparto: {
          ...updatedClienteporReparto,
          reparto: reparto,
          cliente: cliente,
          dia_descripcion: reparto?.descripcion,
          cliente_nombre: cliente?.nombre
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
      await clienteporRepartoService.delete(parseInt(id));
      
      return NextResponse.json({
        success: true,
        message: 'Asignación eliminada exitosamente'
      });
    } catch (dbError) {
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
