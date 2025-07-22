import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/database/adapter.js';

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    const db = getDatabase();
    const dbInfo = db.getDatabaseInfo();
    
    // Intentar obtener usuarios
    try {
      const users = await db.getAllUsers();
      
      return NextResponse.json({
        success: true,
        users,
        total: users.length,
        database: dbInfo
      });
    } catch (dbError) {
      console.error('Error con base de datos:', dbError);
      
      return NextResponse.json(
        { success: false, error: 'Error de base de datos', details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuarios', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo usuario
export async function POST(request) {
  try {
    const userData = await request.json();
    
    // Validación básica
    if (!userData.usuario || !userData.password) {
      return NextResponse.json(
        { success: false, error: 'Usuario y password son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el usuario tenga al menos 3 caracteres
    if (userData.usuario.length < 3) {
      return NextResponse.json(
        { success: false, error: 'El usuario debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    // Validar que el password tenga al menos 6 caracteres
    if (userData.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    try {
      const newUser = await db.createUser(userData);
      return NextResponse.json({
        success: true,
        user: newUser,
        message: 'Usuario creado exitosamente'
      });
    } catch (dbError) {
      console.error('Error con base de datos al crear usuario:', dbError);
      
      // Si hay error de usuario duplicado
      if (dbError.message && dbError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con ese nombre de usuario' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Error al crear usuario en la base de datos' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un usuario existente
export async function PUT(request) {
  try {
    const userData = await request.json();
    
    if (!userData.id) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Validaciones opcionales (solo si se proporcionan)
    if (userData.usuario && userData.usuario.length < 3) {
      return NextResponse.json(
        { success: false, error: 'El usuario debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    if (userData.password && userData.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    try {
      const updatedUser = await db.updateUser(userData.id, userData);
      
      if (!updatedUser) {
        return NextResponse.json(
          { success: false, error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'Usuario actualizado exitosamente'
      });
    } catch (dbError) {
      console.error('Error con base de datos al actualizar usuario:', dbError);
      
      if (dbError.message && (dbError.message.includes('UNIQUE constraint failed') || dbError.message.includes('duplicate'))) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con ese nombre de usuario' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Error al actualizar usuario en la base de datos' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un usuario
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario válido requerido' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    try {
      const deleted = await db.deleteUser(id);
      
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (dbError) {
      console.error('Error con base de datos al eliminar usuario:', dbError);
      return NextResponse.json(
        { success: false, error: 'Error al eliminar usuario de la base de datos' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}
