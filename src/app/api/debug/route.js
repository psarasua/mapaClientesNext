import { NextResponse } from 'next/server';

// Configurar runtime para compatibilidad
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Información del ambiente
    const environmentInfo = {
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      nextjsVersion: '15.4.2',
      platform: process.platform,
      nodeVersion: process.version,
      hasEnvVars: {
        TURSO_DATABASE_URL: !!process.env.TURSO_DATABASE_URL,
        TURSO_AUTH_TOKEN: !!process.env.TURSO_AUTH_TOKEN,
        JWT_SECRET: !!process.env.JWT_SECRET,
      },
      urlLength: process.env.TURSO_DATABASE_URL?.length || 0,
      tokenLength: process.env.TURSO_AUTH_TOKEN?.length || 0,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
    };

    console.log('🔍 Debug info:', environmentInfo);

    return NextResponse.json({
      status: 'ok',
      message: 'Debug endpoint funcionando',
      environment: environmentInfo
    });

  } catch (error) {
    console.error('❌ Error en debug endpoint:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error en debug endpoint',
      error: {
        name: error.constructor.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5)
      }
    }, { status: 500 });
  }
}
