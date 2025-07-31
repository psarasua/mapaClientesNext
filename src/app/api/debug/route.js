import { NextResponse } from 'next/server';
import { validateEnvironment } from '../../../lib/config.js';

export async function GET() {
  try {
    console.log('🔍 Debug endpoint llamado');
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
      },
      variables: {
        JWT_SECRET: process.env.JWT_SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO',
        TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'CONFIGURADO' : 'NO CONFIGURADO',
        TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'CONFIGURADO' : 'NO CONFIGURADO',
      },
      validation: {
        status: 'checking...'
      }
    };

    // Intentar validar configuración
    try {
      validateEnvironment();
      debugInfo.validation.status = 'OK';
      debugInfo.validation.message = 'Todas las variables están configuradas';
    } catch (error) {
      debugInfo.validation.status = 'ERROR';
      debugInfo.validation.message = error.message;
    }

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 