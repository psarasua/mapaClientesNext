import { NextResponse } from 'next/server';
import DatabaseAdapter from '@/lib/database/adapter';
import { verifyPassword, generateToken } from '@/lib/auth';

// Configurar runtime para compatibilidad con dependencias
export const runtime = 'nodejs';

export async function POST(request) {
  console.log('🔍 [LOGIN-DEBUG] Iniciando proceso de login...');
  
  try {
    console.log('🔍 [LOGIN-DEBUG] 1. Parseando request body...');
    const { usuario, password } = await request.json();
    console.log(`🔍 [LOGIN-DEBUG] Usuario recibido: ${usuario}`);
    console.log(`🔍 [LOGIN-DEBUG] Password length: ${password?.length || 0}`);
    
    // Validar datos de entrada
    if (!usuario || !password) {
      console.log('🔍 [LOGIN-DEBUG] ❌ Faltan credenciales');
      return NextResponse.json({
        success: false,
        error: 'Usuario y contraseña son requeridos'
      }, { status: 400 });
    }

    console.log('🔍 [LOGIN-DEBUG] 2. Creando DatabaseAdapter...');
    console.log(`🔍 [LOGIN-DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
    
    const db = new DatabaseAdapter();
    console.log('🔍 [LOGIN-DEBUG] DatabaseAdapter creado exitosamente');
    
    try {
      console.log('🔍 [LOGIN-DEBUG] 3. Buscando usuario...');
      console.log(`🔍 [LOGIN-DEBUG] Ejecutando getUserByUsernameOrEmail("${usuario}")`);
      
      const user = await db.getUserByUsernameOrEmail(usuario);
      
      if (!user) {
        console.log('🔍 [LOGIN-DEBUG] ❌ Usuario no encontrado');
        return NextResponse.json({
          success: false,
          error: 'Credenciales inválidas'
        }, { status: 401 });
      }
      
      console.log(`🔍 [LOGIN-DEBUG] ✅ Usuario encontrado: ${user.usuario}`);
      console.log(`🔍 [LOGIN-DEBUG] User ID: ${user.id}`);
      console.log(`🔍 [LOGIN-DEBUG] Password hash preview: ${user.password?.substring(0, 20)}...`);

      console.log('🔍 [LOGIN-DEBUG] 4. Verificando contraseña...');
      const isValidPassword = await verifyPassword(password, user.password);
      console.log(`🔍 [LOGIN-DEBUG] Resultado verificación: ${isValidPassword}`);
      
      if (!isValidPassword) {
        console.log('🔍 [LOGIN-DEBUG] ❌ Contraseña inválida');
        return NextResponse.json({
          success: false,
          error: 'Credenciales inválidas'
        }, { status: 401 });
      }

      console.log('🔍 [LOGIN-DEBUG] 5. Generando token JWT...');
      const token = generateToken(user);
      console.log(`🔍 [LOGIN-DEBUG] Token generado: ${token.substring(0, 50)}...`);

      console.log('🔍 [LOGIN-DEBUG] 6. Preparando respuesta...');
      const { password: _, ...userWithoutPassword } = user;

      const response = {
        success: true,
        message: 'Login exitoso',
        user: userWithoutPassword,
        token,
        debug: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          databaseType: process.env.NODE_ENV === 'production' ? 'Turso' : 'SQLite'
        }
      };

      console.log('🔍 [LOGIN-DEBUG] ✅ Login exitoso completamente');
      return NextResponse.json(response);

    } catch (dbError) {
      console.error('🔍 [LOGIN-DEBUG] ❌ Error de base de datos:', dbError);
      console.error('🔍 [LOGIN-DEBUG] Error name:', dbError.constructor.name);
      console.error('🔍 [LOGIN-DEBUG] Error message:', dbError.message);
      console.error('🔍 [LOGIN-DEBUG] Error code:', dbError.code);
      console.error('🔍 [LOGIN-DEBUG] Error stack:', dbError.stack?.split('\n').slice(0, 10).join('\n'));
      
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor',
        debug: {
          errorType: 'DatabaseError',
          errorName: dbError.constructor.name,
          errorMessage: dbError.message,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('🔍 [LOGIN-DEBUG] ❌ Error general:', error);
    console.error('🔍 [LOGIN-DEBUG] Error name:', error.constructor.name);
    console.error('🔍 [LOGIN-DEBUG] Error message:', error.message);
    console.error('🔍 [LOGIN-DEBUG] Error stack:', error.stack?.split('\n').slice(0, 10).join('\n'));
    
    return NextResponse.json({
      success: false,
      error: 'Error procesando la solicitud',
      debug: {
        errorType: 'GeneralError',
        errorName: error.constructor.name,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Login debug endpoint - Use POST para probar login',
    instructions: {
      method: 'POST',
      body: {
        usuario: 'admin',
        password: 'admin123'
      }
    }
  });
}
