import { NextResponse } from 'next/server';
import { userService, truckService } from '../../../lib/dbServices.js';

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
        'CRUD de clientes',
        'CRUD de repartos',
        'Base de datos Turso',
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
