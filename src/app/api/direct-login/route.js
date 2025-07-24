import { NextResponse } from 'next/server';

// Configurar runtime para compatibilidad
export const runtime = 'nodejs';

export async function POST(request) {
  console.log('🔍 [DIRECT-LOGIN] Iniciando login directo...');
  
  try {
    // Paso 1: Parsear body
    console.log('🔍 [DIRECT-LOGIN] 1. Parseando body...');
    const { usuario, password } = await request.json();
    console.log(`🔍 [DIRECT-LOGIN] Usuario: ${usuario}, Password length: ${password?.length}`);
    
    if (!usuario || !password) {
      console.log('🔍 [DIRECT-LOGIN] ❌ Credenciales faltantes');
      return NextResponse.json({
        success: false,
        error: 'Credenciales requeridas'
      }, { status: 400 });
    }

    // Paso 2: Verificar variables de entorno
    console.log('🔍 [DIRECT-LOGIN] 2. Verificando env vars...');
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.log('🔍 [DIRECT-LOGIN] ❌ Variables de entorno faltantes');
      return NextResponse.json({
        success: false,
        error: 'Configuración del servidor incompleta'
      }, { status: 500 });
    }

    // Paso 3: Importar y conectar a Turso
    console.log('🔍 [DIRECT-LOGIN] 3. Conectando a Turso...');
    const { createClient } = await import('@libsql/client');
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Paso 4: Buscar usuario
    console.log('🔍 [DIRECT-LOGIN] 4. Buscando usuario...');
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE usuario = ? LIMIT 1',
      args: [usuario]
    });

    if (result.rows.length === 0) {
      console.log('🔍 [DIRECT-LOGIN] ❌ Usuario no encontrado');
      return NextResponse.json({
        success: false,
        error: 'Credenciales inválidas'
      }, { status: 401 });
    }

    const user = result.rows[0];
    console.log(`🔍 [DIRECT-LOGIN] ✅ Usuario encontrado: ${user.usuario}`);

    // Paso 5: Verificar contraseña
    console.log('🔍 [DIRECT-LOGIN] 5. Verificando password...');
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`🔍 [DIRECT-LOGIN] Password válido: ${isValid}`);

    if (!isValid) {
      console.log('🔍 [DIRECT-LOGIN] ❌ Password inválido');
      return NextResponse.json({
        success: false,
        error: 'Credenciales inválidas'
      }, { status: 401 });
    }

    // Paso 6: Generar token
    console.log('🔍 [DIRECT-LOGIN] 6. Generando token...');
    const jwt = await import('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, usuario: user.usuario },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    // Respuesta exitosa
    console.log('🔍 [DIRECT-LOGIN] 7. ✅ Login exitoso');
    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        usuario: user.usuario,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token,
      debug: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        method: 'direct-turso'
      }
    });

  } catch (error) {
    console.error('🔍 [DIRECT-LOGIN] ❌ Error:', error);
    console.error('🔍 [DIRECT-LOGIN] Error name:', error.constructor.name);
    console.error('🔍 [DIRECT-LOGIN] Error message:', error.message);
    console.error('🔍 [DIRECT-LOGIN] Error stack:', error.stack?.split('\n').slice(0, 10).join('\n'));
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      debug: {
        errorType: error.constructor.name,
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
        step: 'unknown'
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Direct login endpoint - Use POST',
    instructions: {
      method: 'POST',
      body: {
        usuario: 'admin',
        password: 'admin123'
      }
    }
  });
}
