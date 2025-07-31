import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import { repartoService } from '../../../lib/services/repartoService.js';
import { validateCreateRepartoData } from '../../../types/index.js';

// Configurar runtime para compatibilidad con bcrypt y otras dependencias
export const runtime = 'nodejs';

// GET - Obtener todos los repartos
export async function GET(request) {
  try {
    // Verificar autenticación
    const authResult = requireAuth(request);
    if (authResult) {
      return authResult;
    }

    const repartos = await repartoService.getAll();
    
    return NextResponse.json({
      success: true,
      repartos,
      total: repartos.length,
      source: 'database'
    });
  } catch (error) {
    console.error('Error obteniendo repartos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Crear un nuevo reparto
export async function POST(request) {
  try {
    // Verificar autenticación
    const authResult = requireAuth(request);
    if (authResult) {
      return authResult;
    }

    const repartoData = await request.json();
    
    // Validar datos de entrada
    if (!validateCreateRepartoData(repartoData)) {
      return NextResponse.json({
        success: false,
        error: 'Datos de reparto inválidos'
      }, { status: 400 });
    }

    const newReparto = await repartoService.create(repartoData);
    
    return NextResponse.json({
      success: true,
      reparto: newReparto,
      message: 'Reparto creado exitosamente'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando reparto:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - Actualizar un reparto existente
export async function PUT(request) {
  try {
    // Verificar autenticación
    const authResult = requireAuth(request);
    if (authResult) {
      return authResult;
    }

    const repartoData = await request.json();
    
    if (!repartoData.id) {
      return NextResponse.json({
        success: false,
        error: 'ID de reparto requerido para actualización'
      }, { status: 400 });
    }

    const updatedReparto = await repartoService.update(repartoData.id, repartoData);
    
    return NextResponse.json({
      success: true,
      reparto: updatedReparto,
      message: 'Reparto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando reparto:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Eliminar un reparto
export async function DELETE(request) {
  try {
    // Verificar autenticación
    const authResult = requireAuth(request);
    if (authResult) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de reparto requerido para eliminación'
      }, { status: 400 });
    }

    await repartoService.delete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Reparto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando reparto:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    }, { status: 500 });
  }
} 