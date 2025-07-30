import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import { truckService } from '../../../lib/dbServices.js';

// GET - Obtener todos los camiones
export async function GET(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const trucks = await truckService.getAll();
    
    return NextResponse.json({
      success: true,
      trucks,
      total: trucks.length
    });
  } catch (error) {
    console.error('Error obteniendo camiones:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Crear un nuevo camión
export async function POST(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const truckData = await request.json();
    
    // Validación básica
    if (!truckData.description) {
      return NextResponse.json(
        { success: false, error: 'Descripción es requerida' },
        { status: 400 }
      );
    }

    // Validar placa si se proporciona
    if (truckData.license_plate && truckData.license_plate.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Placa debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    // Validar año si se proporciona
    if (truckData.year !== undefined) {
      const currentYear = new Date().getFullYear();
      if (typeof truckData.year !== 'number' || truckData.year < 1950 || truckData.year > currentYear + 1) {
        return NextResponse.json(
          { success: false, error: `El año debe ser un número entre 1950 y ${currentYear + 1}` },
          { status: 400 }
        );
      }
    }

    try {
      const newTruck = await prisma.truck.create({
        data: truckData
      });
      
      return NextResponse.json({
        success: true,
        truck: newTruck,
        message: 'Camión creado exitosamente'
      });
    } catch (dbError) {
      if (dbError.code === 'P2002' && dbError.meta?.target?.includes('license_plate')) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un camión con esa placa' },
          { status: 409 }
        );
      }
      
      console.error('Error creando camión:', dbError);
      return NextResponse.json(
        { success: false, error: 'Error al crear camión' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al crear camión:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un camión existente
export async function PUT(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const truckData = await request.json();
    
    if (!truckData.id) {
      return NextResponse.json(
        { success: false, error: 'ID de camión requerido' },
        { status: 400 }
      );
    }

    // Validaciones opcionales (solo si se proporcionan)
    if (truckData.license_plate && truckData.license_plate.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Placa debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    if (truckData.year !== undefined) {
      const currentYear = new Date().getFullYear();
      if (typeof truckData.year !== 'number' || truckData.year < 1950 || truckData.year > currentYear + 1) {
        return NextResponse.json(
          { success: false, error: `El año debe ser un número entre 1950 y ${currentYear + 1}` },
          { status: 400 }
        );
      }
    }

    try {
      const updatedTruck = await prisma.truck.update({
        where: { id: parseInt(truckData.id) },
        data: truckData
      });

      return NextResponse.json({
        success: true,
        truck: updatedTruck,
        message: 'Camión actualizado exitosamente'
      });
    } catch (dbError) {
      if (dbError.code === 'P2002' && dbError.meta?.target?.includes('license_plate')) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un camión con esa placa' },
          { status: 409 }
        );
      }
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Camión no encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Error al actualizar camión en la base de datos' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al actualizar camión:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un camión
export async function DELETE(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    
    const id = parseInt(idParam);

    if (!idParam || isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de camión válido requerido' },
        { status: 400 }
      );
    }

    try {
      await prisma.truck.delete({
        where: { id: parseInt(id) }
      });

      return NextResponse.json({
        success: true,
        message: 'Camión eliminado exitosamente'
      });
    } catch (dbError) {
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Camión no encontrado' },
          { status: 404 }
        );
      }
      
      console.error('Error eliminando camión:', dbError);
      return NextResponse.json(
        { success: false, error: 'Error al eliminar camión' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}
