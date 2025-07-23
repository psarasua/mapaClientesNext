import { NextResponse } from 'next/server';
import DatabaseAdapter from '@/lib/database/adapter';

// GET - Obtener todos los camiones
export async function GET() {
  try {
    const db = new DatabaseAdapter();
    
    // Intentar obtener camiones
    try {
      const trucks = await db.getAllTrucks();
      
      // Si no hay camiones, crear datos iniciales
      if (trucks.length === 0) {
        await db.seedInitialTrucks();
        const newTrucks = await db.getAllTrucks();
        return NextResponse.json({
          success: true,
          trucks: newTrucks,
          total: newTrucks.length,
          source: process.env.NODE_ENV === 'production' ? 'turso' : 'sqlite'
        });
      }
      
      return NextResponse.json({
        success: true,
        trucks,
        total: trucks.length,
        source: process.env.NODE_ENV === 'production' ? 'turso' : 'sqlite'
      });
    } catch (dbError) {
      console.error('Error con la base de datos, usando fallback:', dbError);
      
      // Fallback a datos por defecto si SQLite falla
      const fallbackTrucks = [
        {
          id: 1,
          description: 'Camión de carga básico',
          brand: 'Ford',
          model: 'Cargo',
          year: 2020,
          license_plate: 'ABC-123',
          capacity: '15 toneladas',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return NextResponse.json({
        success: true,
        trucks: fallbackTrucks,
        total: fallbackTrucks.length,
        source: 'fallback',
        warning: 'Base de datos no disponible, usando datos de fallback'
      });
    }
  } catch (error) {
    console.error('Error al obtener camiones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener camiones', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo camión
export async function POST(request) {
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

    const db = new DatabaseAdapter();
    
    try {
      const newTruck = await db.createTruck(truckData);
      return NextResponse.json({
        success: true,
        truck: newTruck,
        message: 'Camión creado exitosamente'
      });
    } catch (dbError) {
      console.error('Error con la base de datos al crear camión:', dbError);
      
      // Si hay error de placa duplicada
      if (dbError.message && dbError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un camión con esa placa' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Error al crear camión en la base de datos' },
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

    const db = new DatabaseAdapter();
    
    try {
      const updatedTruck = await db.updateTruck(truckData.id, truckData);
      
      if (!updatedTruck) {
        return NextResponse.json(
          { success: false, error: 'Camión no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        truck: updatedTruck,
        message: 'Camión actualizado exitosamente'
      });
    } catch (dbError) {
      console.error('Error con la base de datos al actualizar camión:', dbError);
      
      if (dbError.message && dbError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un camión con esa placa' },
          { status: 409 }
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
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de camión válido requerido' },
        { status: 400 }
      );
    }

    const db = new DatabaseAdapter();
    
    try {
      const deleted = await db.deleteTruck(id);
      
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Camión no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Camión eliminado exitosamente'
      });
    } catch (dbError) {
      console.error('Error con la base de datos al eliminar camión:', dbError);
      return NextResponse.json(
        { success: false, error: 'Error al eliminar camión de la base de datos' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al eliminar camión:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}
