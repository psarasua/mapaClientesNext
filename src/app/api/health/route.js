import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';

// Configurar runtime para compatibilidad
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    let dbStatus = 'ok';
    let dbMessage = 'Base de datos conectada correctamente';
    let dbType = process.env.NODE_ENV === 'production' ? 'Turso (cloud)' : 'SQLite (local)';
    
    try {
      // Intentar hacer consultas simples para verificar conectividad
      const users = await prisma.user.count();
      const trucks = await prisma.truck.count();
      dbMessage = `Base de datos conectada correctamente. ${users} usuarios y ${trucks} camiones registrados.`;
    } catch (error) {
      dbStatus = 'error';
      dbMessage = `Error de conexión a base de datos: ${error.message}`;
    }

    return NextResponse.json({
      status: 'ok',
      message: 'API está funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '2.1.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        message: dbMessage,
        type: dbType
      },
      features: [
        'CRUD de usuarios',
        'CRUD de camiones',
        'Base de datos SQLite',
        'Fallback a localStorage',
        'Validación de datos',
        'Manejo de errores',
        'Interfaz con pestañas'
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
