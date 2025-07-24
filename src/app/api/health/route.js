import { NextResponse } from 'next/server';
import DatabaseAdapter from '../../../lib/database/adapter';

// Configurar runtime para compatibilidad
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('🔍 [HEALTH] Iniciando health check extendido...');
    
    // Información básica
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      nextjsVersion: '15.4.2',
      nodeVersion: process.version,
      platform: process.platform,
      
      // Variables de entorno (sin mostrar valores)
      envVars: {
        TURSO_DATABASE_URL: !!process.env.TURSO_DATABASE_URL,
        TURSO_AUTH_TOKEN: !!process.env.TURSO_AUTH_TOKEN,
        JWT_SECRET: !!process.env.JWT_SECRET,
        NODE_ENV: process.env.NODE_ENV,
      },
      
      // Información de lengths para verificar
      envLengths: {
        tursoUrlLength: process.env.TURSO_DATABASE_URL?.length || 0,
        tursoTokenLength: process.env.TURSO_AUTH_TOKEN?.length || 0,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      },
      
      imports: {}
    };

    console.log('🔍 [HEALTH] Health data básica preparada');

    // Probar importaciones críticas una por una
    console.log('🔍 [HEALTH] Probando bcrypt...');
    try {
      const bcrypt = await import('bcryptjs');
      healthData.imports.bcrypt = '✅';
      console.log('🔍 [HEALTH] bcrypt: ✅');
    } catch (e) {
      healthData.imports.bcrypt = `❌ ${e.message}`;
      console.log('🔍 [HEALTH] bcrypt: ❌', e.message);
    }

    console.log('🔍 [HEALTH] Probando jwt...');
    try {
      const jwt = await import('jsonwebtoken');
      healthData.imports.jwt = '✅';
      console.log('🔍 [HEALTH] jwt: ✅');
    } catch (e) {
      healthData.imports.jwt = `❌ ${e.message}`;
      console.log('🔍 [HEALTH] jwt: ❌', e.message);
    }

    console.log('🔍 [HEALTH] Probando turso...');
    try {
      const { createClient } = await import('@libsql/client');
      healthData.imports.turso = '✅';
      console.log('🔍 [HEALTH] turso: ✅');
    } catch (e) {
      healthData.imports.turso = `❌ ${e.message}`;
      console.log('🔍 [HEALTH] turso: ❌', e.message);
    }

    // Probar conexión a base de datos si las env vars están disponibles
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      console.log('🔍 [HEALTH] Probando conexión a Turso...');
      try {
        const { createClient } = await import('@libsql/client');
        const client = createClient({
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN,
        });
        
        const result = await client.execute('SELECT 1 as test');
        healthData.database = {
          status: '✅ Connected',
          testQuery: result.rows[0],
          type: 'Turso'
        };
        console.log('🔍 [HEALTH] Database: ✅');
      } catch (e) {
        healthData.database = {
          status: `❌ ${e.message}`,
          error: e.constructor.name,
          type: 'Turso'
        };
        console.log('🔍 [HEALTH] Database: ❌', e.message);
      }
    } else {
      healthData.database = {
        status: '⚠️ Environment variables missing',
        type: 'Unknown'
      };
    }

    // Probar DatabaseAdapter
    console.log('🔍 [HEALTH] Probando DatabaseAdapter...');
    try {
      const db = new DatabaseAdapter();
      await db.init();
      const users = await db.getAllUsers();
      
      healthData.databaseAdapter = {
        status: '✅ Working',
        userCount: users.length,
        type: process.env.NODE_ENV === 'production' ? 'Turso' : 'SQLite'
      };
      console.log('🔍 [HEALTH] DatabaseAdapter: ✅');
    } catch (e) {
      healthData.databaseAdapter = {
        status: `❌ ${e.message}`,
        error: e.constructor.name
      };
      console.log('🔍 [HEALTH] DatabaseAdapter: ❌', e.message);
    }

    console.log('🔍 [HEALTH] ✅ Health check completado');
    return NextResponse.json(healthData);

  } catch (error) {
    console.error('🔍 [HEALTH] ❌ Error en health check:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: {
        name: error.constructor.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5)
      }
    }, { status: 500 });
  }
}
