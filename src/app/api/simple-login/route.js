import { NextResponse } from 'next/server';

// Configurar runtime para compatibilidad
export const runtime = 'nodejs';

export async function POST(request) {
  console.log('🔍 [SIMPLE-LOGIN] Iniciando...');
  
  try {
    // Paso 1: Parsear body
    console.log('🔍 [SIMPLE-LOGIN] 1. Parseando body...');
    const { usuario, password } = await request.json();
    console.log(`🔍 [SIMPLE-LOGIN] Usuario: ${usuario}, Password length: ${password?.length}`);
    
    if (!usuario || !password) {
      console.log('🔍 [SIMPLE-LOGIN] ❌ Credenciales faltantes');
      return NextResponse.json({
        success: false,
        error: 'Credenciales requeridas'
      }, { status: 400 });
    }

    // Paso 2: Verificar variables de entorno
    console.log('🔍 [SIMPLE-LOGIN] 2. Verificando env vars...');
    const hasEnvVars = {
      TURSO_DATABASE_URL: !!process.env.TURSO_DATABASE_URL,
      TURSO_AUTH_TOKEN: !!process.env.TURSO_AUTH_TOKEN,
      JWT_SECRET: !!process.env.JWT_SECRET,
    };
    console.log('🔍 [SIMPLE-LOGIN] Env vars:', hasEnvVars);

    // Paso 3: Probar importación de bcrypt
    console.log('🔍 [SIMPLE-LOGIN] 3. Importando bcrypt...');
    const bcrypt = await import('bcryptjs');
    console.log('🔍 [SIMPLE-LOGIN] ✅ bcrypt importado');

    // Paso 4: Probar importación de Turso
    console.log('🔍 [SIMPLE-LOGIN] 4. Importando Turso...');
    const { createClient } = await import('@libsql/client');
    console.log('🔍 [SIMPLE-LOGIN] ✅ Turso importado');

    // Paso 5: Crear cliente Turso
    console.log('🔍 [SIMPLE-LOGIN] 5. Creando cliente Turso...');
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    console.log('🔍 [SIMPLE-LOGIN] ✅ Cliente creado');

    // Paso 6: Hacer query
    console.log('🔍 [SIMPLE-LOGIN] 6. Ejecutando query...');
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE usuario = ? LIMIT 1',
      args: [usuario]
    });
    console.log(`🔍 [SIMPLE-LOGIN] Query ejecutada, rows: ${result.rows.length}`);

    if (result.rows.length === 0) {
      console.log('🔍 [SIMPLE-LOGIN] ❌ Usuario no encontrado');
      return NextResponse.json({
        success: false,
        error: 'Credenciales inválidas'
      }, { status: 401 });
    }

    const user = result.rows[0];
    console.log(`🔍 [SIMPLE-LOGIN] ✅ Usuario encontrado: ${user.usuario}`);

    // Paso 7: Verificar contraseña
    console.log('🔍 [SIMPLE-LOGIN] 7. Verificando password...');
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`🔍 [SIMPLE-LOGIN] Password válido: ${isValid}`);

    if (!isValid) {
      console.log('🔍 [SIMPLE-LOGIN] ❌ Password inválido');
      return NextResponse.json({
        success: false,
        error: 'Credenciales inválidas'
      }, { status: 401 });
    }

    // Paso 8: Generar token
    console.log('🔍 [SIMPLE-LOGIN] 8. Generando token...');
    const jwt = await import('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, usuario: user.usuario },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    console.log(`🔍 [SIMPLE-LOGIN] ✅ Token generado: ${token.substring(0, 20)}...`);

    // Respuesta exitosa
    console.log('🔍 [SIMPLE-LOGIN] 9. ✅ Login exitoso');
    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        usuario: user.usuario
      },
      token,
      debug: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('🔍 [SIMPLE-LOGIN] ❌ Error:', error);
    console.error('🔍 [SIMPLE-LOGIN] Error name:', error.constructor.name);
    console.error('🔍 [SIMPLE-LOGIN] Error message:', error.message);
    console.error('🔍 [SIMPLE-LOGIN] Error stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      debug: {
        errorType: error.constructor.name,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple login endpoint - Use POST',
    test: 'working'
  });
}
