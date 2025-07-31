import { NextResponse } from 'next/server';
import { userService, truckService } from '../../../lib/dbServices.js';
import { createClient } from '@libsql/client';
import jwt from 'jsonwebtoken';

// Configurar runtime para compatibilidad
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    let dbStatus = 'ok';
    let dbMessage = 'Base de datos conectada correctamente';
    let dbType = 'Turso (libSQL)';
    
    try {
      // Intentar hacer consultas simples para verificar conectividad
      const users = await userService.count();
      const trucks = await truckService.getAll();
      const truckCount = trucks.length;
      dbMessage = `Base de datos conectada correctamente. ${users} usuarios y ${truckCount} camiones registrados.`;
    } catch (error) {
      dbStatus = 'error';
      dbMessage = `Error de conexión a base de datos: ${error.message}`;
    }

    // Verificación completa de variables de entorno
    const requiredEnvVars = [
      'DATABASE_URL',
      'TURSO_DATABASE_URL', 
      'TURSO_AUTH_TOKEN',
      'JWT_SECRET',
      'NODE_ENV'
    ];

    const optionalEnvVars = [
      'NEXT_PUBLIC_APP_URL'
    ];

    // Función para validar cada variable
    const validateEnvVar = async (varName, value) => {
      const validation = {
        configured: !!value,
        valid: false,
        status: '',
        preview: null,
        error: null
      };

      if (!value) {
        validation.status = '❌ Faltante';
        return validation;
      }

      // Validaciones específicas por variable
      switch (varName) {
        case 'DATABASE_URL':
          if (value.startsWith('libsql://') && value.includes('turso.io')) {
            // Probar conexión solo si la base de datos principal ya falló
            if (dbStatus === 'error') {
              try {
                const client = createClient({
                  url: value.includes('?authToken=') ? value.split('?authToken=')[0] : process.env.TURSO_DATABASE_URL,
                  authToken: value.includes('?authToken=') ? value.split('?authToken=')[1] : process.env.TURSO_AUTH_TOKEN,
                });
                await client.execute('SELECT 1');
                validation.valid = true;
                validation.status = '✅ Válida y conectada';
              } catch (error) {
                validation.status = '⚠️ Configurada pero no conecta';
                validation.error = error.message;
              }
            } else {
              validation.valid = true;
              validation.status = '✅ Válida y conectada';
            }
          } else if (value.startsWith('file:')) {
            validation.valid = true;
            validation.status = '✅ SQLite local válida';
          } else {
            validation.status = '❌ Formato inválido';
          }
          validation.preview = `${value.substring(0, 20)}...`;
          break;

        case 'TURSO_DATABASE_URL':
          if (value.startsWith('libsql://') && value.includes('turso.io')) {
            validation.valid = true;
            validation.status = '✅ URL válida';
          } else {
            validation.status = '❌ Formato inválido (debe ser libsql://...turso.io)';
          }
          validation.preview = value;
          break;

        case 'TURSO_AUTH_TOKEN':
          if (value.startsWith('eyJ')) {
            try {
              const parts = value.split('.');
              if (parts.length === 3) {
                JSON.parse(atob(parts[1])); // Decodificar payload
                validation.valid = true;
                validation.status = '✅ JWT válido';
              } else {
                validation.status = '❌ JWT malformado';
              }
            } catch {
              validation.status = '❌ Token inválido';
            }
          } else {
            validation.status = '❌ Formato inválido (debe ser JWT)';
          }
          validation.preview = `${value.substring(0, 20)}...${value.substring(value.length - 10)}`;
          break;

        case 'JWT_SECRET':
          if (value.length >= 32) {
            try {
              jwt.sign({ test: true }, value, { expiresIn: '1h' });
              validation.valid = true;
              validation.status = '✅ Secret válido';
            } catch (error) {
              validation.status = '❌ Secret inválido';
              validation.error = error.message;
            }
          } else {
            validation.status = '⚠️ Muy corto (min 32 caracteres)';
          }
          validation.preview = `${value.substring(0, 8)}...(${value.length} chars)`;
          break;

        case 'NODE_ENV':
          const validEnvs = ['development', 'production', 'test'];
          if (validEnvs.includes(value)) {
            validation.valid = true;
            validation.status = '✅ Valor válido';
          } else {
            validation.status = `❌ Inválido (debe ser: ${validEnvs.join(', ')})`;
          }
          validation.preview = value;
          break;

        case 'NEXT_PUBLIC_APP_URL':
          try {
            new URL(value);
            validation.valid = true;
            validation.status = '✅ URL válida';
          } catch {
            validation.status = '❌ URL inválida';
          }
          validation.preview = value;
          break;

        default:
          validation.valid = true;
          validation.status = '✅ Configurada';
          validation.preview = `${value.substring(0, 10)}...`;
      }

      return validation;
    };

    // Verificar todas las variables
    const envStatus = {};
    let allRequiredConfigured = true;

    for (const varName of requiredEnvVars) {
      const validation = await validateEnvVar(varName, process.env[varName]);
      envStatus[varName] = {
        ...validation,
        required: true
      };
      
      if (!validation.configured || !validation.valid) {
        allRequiredConfigured = false;
      }
    }

    for (const varName of optionalEnvVars) {
      const validation = await validateEnvVar(varName, process.env[varName]);
      envStatus[varName] = {
        ...validation,
        required: false
      };
    }

    // Recomendaciones basadas en el estado
    const recommendations = [];
    
    if (!envStatus.JWT_SECRET?.valid) {
      recommendations.push('Configurar JWT_SECRET válido (mínimo 32 caracteres) para autenticación segura');
    }
    
    if (!envStatus.DATABASE_URL?.valid && !envStatus.TURSO_DATABASE_URL?.valid) {
      recommendations.push('Verificar configuración de base de datos - no se puede conectar');
    }
    
    if (!envStatus.TURSO_AUTH_TOKEN?.valid && process.env.DATABASE_URL?.includes('turso.io')) {
      recommendations.push('Token de Turso inválido - verificar que sea un JWT válido');
    }
    
    if (process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV === 'production') {
      recommendations.push('NODE_ENV debería ser "production" en producción');
    }

    // Errores específicos encontrados
    const errors = [];
    Object.entries(envStatus).forEach(([key, status]) => {
      if (status.error) {
        errors.push(`${key}: ${status.error}`);
      }
    });

    return NextResponse.json({
      status: (dbStatus === 'ok' && allRequiredConfigured) ? 'ok' : 'warning',
      message: 'Health check completo - API y configuración',
      timestamp: new Date().toISOString(),
      version: '2.2.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        message: dbMessage,
        type: dbType
      },
      environmentVariables: envStatus,
      analysis: {
        overallStatus: allRequiredConfigured ? 'ready' : 'incomplete',
        message: allRequiredConfigured ? 
          'Todas las variables requeridas están configuradas y válidas' : 
          'Algunas variables requeridas están faltantes o inválidas',
        databaseConnection: dbStatus === 'ok' ? 'Conectada' : 'Error de conexión'
      },
      recommendations: recommendations.length > 0 ? recommendations : ['✅ Configuración correcta'],
      errors: errors.length > 0 ? errors : null,
      deployment: {
        vercelEnv: process.env.VERCEL_ENV || 'local',
        vercelUrl: process.env.VERCEL_URL || 'localhost',
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local-dev'
      },
      features: [
        'CRUD de usuarios',
        'CRUD de camiones',  
        'CRUD de clientes',
        'CRUD de repartos',
        'Base de datos Turso',
        'Validación de datos',
        'Manejo de errores',
        'Interfaz con pestañas',
        'Verificación completa de configuración'
      ]
    });
  } catch (error) {
    console.error('Error en health check:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
}
