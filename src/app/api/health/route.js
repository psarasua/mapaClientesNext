import { NextResponse } from 'next/server';
import { getSQLiteDB } from '../../../lib/database/sqlite.js';

export async function GET() {
  try {
    // Verificar conexión a SQLite
    const db = getSQLiteDB();
    let dbStatus = 'ok';
    let dbMessage = 'SQLite conectado correctamente';
    
    try {
      const usersCount = await db.getUsersCount();
      const trucksCount = await db.getTrucksCount();
      dbMessage = `SQLite conectado correctamente. ${usersCount} usuarios y ${trucksCount} camiones registrados.`;
    } catch (error) {
      dbStatus = 'warning';
      dbMessage = 'SQLite no disponible, usando fallback a localStorage';
      console.warn('SQLite no disponible:', error.message);
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
        type: 'SQLite with localStorage fallback'
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
