import { NextResponse } from 'next/server';
import { getSQLiteDB } from '../../../lib/database/sqlite.js';

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    const db = getSQLiteDB();
    
    // Intentar obtener usuarios de SQLite
    try {
      const users = await db.getAllUsers();
      
      // Si no hay usuarios, crear datos iniciales
      if (users.length === 0) {
        await db.seedInitialData();
        const newUsers = await db.getAllUsers();
        return NextResponse.json({
          success: true,
          users: newUsers,
          total: newUsers.length,
          source: 'sqlite'
        });
      }
      
      return NextResponse.json({
        success: true,
        users,
        total: users.length,
        source: 'sqlite'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite, usando fallback:', sqliteError);
      
      // Fallback a datos por defecto si SQLite falla
      const fallbackUsers = [
        {
          id: 1,
          name: 'Juan Pérez',
          email: 'juan@example.com',
          age: 25,
          phone: '+34 666 123 456',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'María García',
          email: 'maria@example.com',
          age: 30,
          phone: '+34 666 789 012',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return NextResponse.json({
        success: true,
        users: fallbackUsers,
        total: fallbackUsers.length,
        source: 'fallback',
        warning: 'SQLite no disponible, usando datos de fallback'
      });
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
    if (!userData.name || !userData.email || !userData.age) {
      return NextResponse.json(
        { success: false, error: 'Nombre, email y edad son requeridos' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar edad
    if (typeof userData.age !== 'number' || userData.age < 1 || userData.age > 120) {
      return NextResponse.json(
        { success: false, error: 'La edad debe ser un número entre 1 y 120' },
        { status: 400 }
      );
    }

    const db = getSQLiteDB();
    
    try {
      const newUser = await db.createUser(userData);
      return NextResponse.json({
        success: true,
        user: newUser,
        message: 'Usuario creado exitosamente'
      });
    } catch (sqliteError) {
      console.error('Error con SQLite al crear usuario:', sqliteError);
      
      // Si hay error de email duplicado
      if (sqliteError.message && sqliteError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con ese email' },
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
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return NextResponse.json(
          { success: false, error: 'Email inválido' },
          { status: 400 }
        );
      }
    }

    if (userData.age !== undefined) {
      if (typeof userData.age !== 'number' || userData.age < 1 || userData.age > 120) {
        return NextResponse.json(
          { success: false, error: 'La edad debe ser un número entre 1 y 120' },
          { status: 400 }
        );
      }
    }

    const db = getSQLiteDB();
    
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
    } catch (sqliteError) {
      console.error('Error con SQLite al actualizar usuario:', sqliteError);
      
      if (sqliteError.message && sqliteError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un usuario con ese email' },
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

    const db = getSQLiteDB();
    
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
    } catch (sqliteError) {
      console.error('Error con SQLite al eliminar usuario:', sqliteError);
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
