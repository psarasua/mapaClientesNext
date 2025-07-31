import { NextResponse } from 'next/server';
import { userService } from '../../../../lib/services/userService.js';
import { verifyPassword, generateToken } from '../../../../lib/auth.js';
import { validateObject, validationSchemas } from '../../../../lib/validation.js';
import { logger } from '../../../../lib/logger.js';

// Configurar runtime para compatibilidad con bcrypt y otras dependencias
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { usuario, password } = await request.json();
    
    // Validar datos de entrada usando esquemas
    const validation = validateObject({ usuario, password }, validationSchemas.user);
    if (!validation.isValid) {
      logger.warning('Login fallido - validación:', validation.errors);
      return NextResponse.json({
        success: false,
        error: Object.values(validation.errors)[0] || 'Datos de entrada inválidos'
      }, { status: 400 });
    }

    try {
      // Buscar usuario por nombre de usuario
      const user = await userService.getByUsuario(usuario);
      
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
