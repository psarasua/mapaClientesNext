import { NextResponse } from 'next/server';
import DatabaseAdapter from '@/lib/database/adapter';

// POST - Limpiar todos los datos de las tablas
export async function POST(request) {
  try {
    const { action, tables } = await request.json();
    
    if (action !== 'clear') {
      return NextResponse.json(
        { success: false, error: 'Acción no válida' },
        { status: 400 }
      );
    }

    const db = new DatabaseAdapter();
    const results = {};

    // Lista de tablas por defecto si no se especifica
    const tablesToClear = tables || ['users', 'clients', 'trucks', 'repartos', 'diasEntrega', 'clientesporReparto'];

    for (const table of tablesToClear) {
      try {
        let result;
        switch (table) {
          case 'users':
            result = await db.clearAllUsers();
            break;
          case 'clients':
            result = await db.clearAllClients();
            break;
          case 'trucks':
            result = await db.clearAllTrucks();
            break;
          case 'repartos':
            result = await db.clearAllRepartos();
            break;
          case 'diasEntrega':
            result = await db.clearAllDiasEntrega();
            break;
          case 'clientesporReparto':
            result = await db.clearAllClientesporReparto();
            break;
          default:
            results[table] = { success: false, message: `Tabla ${table} no reconocida` };
            continue;
        }
        
        results[table] = { 
          success: true, 
          message: `Tabla ${table} limpiada exitosamente`,
          deletedCount: result?.deletedCount || 0
        };
      } catch (error) {
        console.error(`Error limpiando tabla ${table}:`, error);
        results[table] = { 
          success: false, 
          message: `Error limpiando tabla ${table}: ${error.message}` 
        };
      }
    }

    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = Object.keys(results).length;

    return NextResponse.json({
      success: successCount === totalCount,
      message: `${successCount}/${totalCount} tablas limpiadas exitosamente`,
      results,
      summary: {
        total: totalCount,
        success: successCount,
        failed: totalCount - successCount
      }
    });

  } catch (error) {
    console.error('Error en limpieza de datos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Obtener estado de las tablas
export async function GET() {
  try {
    const db = new DatabaseAdapter();
    const status = {};

    const tables = ['users', 'clients', 'trucks', 'repartos', 'diasEntrega', 'clientesporReparto'];

    for (const table of tables) {
      try {
        let data;
        switch (table) {
          case 'users':
            data = await db.getAllUsers();
            break;
          case 'clients':
            data = await db.getAllClients();
            break;
          case 'trucks':
            data = await db.getAllTrucks();
            break;
          case 'repartos':
            data = await db.getAllRepartos();
            break;
          case 'diasEntrega':
            data = await db.getAllDiasEntrega();
            break;
          case 'clientesporReparto':
            data = await db.getAllClientesporReparto();
            break;
        }
        
        status[table] = {
          count: Array.isArray(data) ? data.length : 0,
          status: 'ok'
        };
      } catch (error) {
        status[table] = {
          count: 0,
          status: 'error',
          error: error.message
        };
      }
    }

    return NextResponse.json({
      success: true,
      tables: status,
      environment: process.env.NODE_ENV || 'development',
      database: process.env.NODE_ENV === 'production' ? 'Turso' : 'SQLite'
    });

  } catch (error) {
    console.error('Error obteniendo estado de tablas:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
