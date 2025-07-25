import { NextResponse } from 'next/server';
import DatabaseAdapter from '../../../lib/database/adapter.js';
import { requireAuth } from '../../../lib/apiAuth.js';

// GET - Obtener todos los usuarios
export async function GET(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const db = new DatabaseAdapter();
    const dbInfo = db.getDatabaseInfo();
    const users = await db.getAllUsers();

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
      database: dbInfo
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Crear nuevo usuario
export async function POST(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const data = await request.json();
    
    // Validar datos requeridos
    if (!data.usuario || !data.password) {
      return NextResponse.json(
        { success: false, error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (data.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar longitud del usuario
    if (data.usuario.length < 3) {
      return NextResponse.json(
        { success: false, error: 'El usuario debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    // Validar formato del usuario (solo letras, números y guiones bajos)
    if (!/^[a-zA-Z0-9_]+$/.test(data.usuario)) {
      return NextResponse.json(
        { success: false, error: 'El usuario solo puede contener letras, números y guiones bajos' },
        { status: 400 }
      );
    }

    const userData = {
      usuario: data.usuario.toLowerCase().trim(),
      password: data.password
    };

    // Validar que no sea contraseña débil
    const weakPasswords = ['123456', 'password', 'admin', 'user', userData.usuario];
    if (weakPasswords.includes(userData.password.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'La contraseña es demasiado débil' },
        { status: 400 }
      );
    }

    // Validar longitud mínima de contraseña
    if (userData.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const db = new DatabaseAdapter();
    
    try {
      const newUser = await db.createUser(userData);
      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          usuario: newUser.usuario,
          created_at: newUser.created_at
        },
        message: 'Usuario creado exitosamente'
      });
    } catch (dbError) {
      if (dbError.message && dbError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { success: false, error: 'El usuario ya existe' },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Actualizar usuario
export async function PUT(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Validar datos
    if (data.usuario && data.usuario.length < 3) {
      return NextResponse.json(
        { success: false, error: 'El usuario debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    if (data.password && data.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    if (data.usuario && !/^[a-zA-Z0-9_]+$/.test(data.usuario)) {
      return NextResponse.json(
        { success: false, error: 'El usuario solo puede contener letras, números y guiones bajos' },
        { status: 400 }
      );
    }

    const updateData = {};
    if (data.usuario) updateData.usuario = data.usuario.toLowerCase().trim();
    if (data.password) updateData.password = data.password;

    const db = new DatabaseAdapter();
    
    try {
      const updatedUser = await db.updateUser(data.id, updateData);
      return NextResponse.json({
        success: true,
        user: {
          id: updatedUser.id,
          usuario: updatedUser.usuario,
          updated_at: updatedUser.updated_at
        },
        message: 'Usuario actualizado exitosamente'
      });
    } catch (dbError) {
      if (dbError.message && dbError.message.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          { success: false, error: 'El usuario ya existe' },
          { status: 409 }
        );
      }
      if (dbError.message && dbError.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    const db = new DatabaseAdapter();
    
    try {
      await db.deleteUser(id);
      return NextResponse.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (dbError) {
      if (dbError.message && dbError.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
