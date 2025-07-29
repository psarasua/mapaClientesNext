import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import { prisma } from '../../../lib/prisma.js';

// POST - Limpiar todos los datos de las tablas
export async function POST(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { action, tables } = await request.json();
    
    if (action !== 'clear') {
      return NextResponse.json(
        { success: false, error: 'Acción no válida' },
        { status: 400 }
      );
    }

    const results = {};

    // Lista de tablas por defecto si no se especifica
    const tablesToClear = tables || ['users', 'clients', 'trucks', 'repartos', 'diasEntrega', 'clientesporReparto'];

    for (const table of tablesToClear) {
      try {
        let result;
        switch (table) {
          case 'users':
            result = await prisma.user.deleteMany({});
            break;
          case 'clients':
            result = await prisma.client.deleteMany({});
            break;
          case 'trucks':
            result = await prisma.truck.deleteMany({});
            break;
          case 'repartos':
            result = await prisma.reparto.deleteMany({});
            break;
          case 'diasEntrega':
            result = await prisma.diaEntrega.deleteMany({});
            break;
          case 'clientesporReparto':
            result = await prisma.clienteporReparto.deleteMany({});
            break;
          default:
            results[table] = { success: false, message: `Tabla ${table} no reconocida` };
            continue;
        }
        
        results[table] = { 
          success: true, 
          message: `Tabla ${table} limpiada exitosamente`,
          deletedCount: result.count
        };
      } catch (error) {
        results[table] = { 
          success: false, 
          message: `Error limpiando tabla ${table}: ${error.message}`,
          error: error.message
        };
      }
    }

    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = Object.keys(results).length;

    const response = {
      success: successCount === totalCount,
      message: `${successCount}/${totalCount} tablas limpiadas exitosamente`,
      results,
      summary: {
        total: totalCount,
        success: successCount,
        failed: totalCount - successCount
      }
    };

    return NextResponse.json(response);

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
export async function GET(request) {
  // Verificar autenticación
  const authError = requireAuth(request);
  if (authError) return authError;

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
