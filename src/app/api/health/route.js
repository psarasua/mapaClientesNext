import { NextResponse } from 'next/server';
import DatabaseAdapter from '../../../lib/database/adapter.js';

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const db = new DatabaseAdapter();
    let dbStatus = 'ok';
    let dbMessage = 'Base de datos conectada correctamente';
    let dbType = process.env.NODE_ENV === 'production' ? 'Turso (cloud)' : 'SQLite (local)';
    
    try {
      // Intentar inicializar y hacer una consulta simple
      await db.init();
      const users = await db.getAllUsers();
      const trucks = await db.getAllTrucks();
      dbMessage = `Base de datos conectada correctamente. ${users.length} usuarios y ${trucks.length} camiones registrados.`;
    } catch (error) {
      dbStatus = 'error';
      dbMessage = `Error de conexión a base de datos: ${error.message}`;
      console.error('Error de base de datos:', error);
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
