import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';
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

    try {
      // Buscar usuario por nombre de usuario
      const user = await prisma.user.findUnique({
        where: { usuario }
      });
      
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

      const response = NextResponse.json({
        success: true,
        message: 'Login exitoso',
        user: userWithoutPassword,
        token
      });

      // Establecer cookie con el token (httpOnly para seguridad)
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      return response;

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
