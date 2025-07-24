import { NextResponse } from 'next/server';
import DatabaseAdapter from '../../../../lib/database/adapter.js';
import { verifyPassword, generateToken } from '../../../../lib/auth.js';

// Configurar runtime para compatibilidad con bcrypt y otras dependencias
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { usuario, password } = await request.json();
    
    // Validar datos de entrada
    if (!usuario || !password) {
      return NextResponse.json({
        success: false,
        error: 'Usuario y contraseña son requeridos'
      }, { status: 400 });
    }

    const db = new DatabaseAdapter();
    
    try {
      // Buscar usuario por nombre de usuario
      const user = await db.getUserByUsernameOrEmail(usuario);
      
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'Credenciales inválidas'
        }, { status: 401 });
      }

      // Verificar contraseña
      const isValidPassword = await verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return NextResponse.json({
          success: false,
          error: 'Credenciales inválidas'
        }, { status: 401 });
      }

      // Generar token JWT
      const token = generateToken(user);

      // Respuesta exitosa (sin incluir la contraseña)
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        success: true,
        message: 'Login exitoso',
        user: userWithoutPassword,
        token
      });

    } catch (dbError) {
      console.error('Error de base de datos en login:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({
      success: false,
      error: 'Error procesando la solicitud'
    }, { status: 500 });
  }
}
