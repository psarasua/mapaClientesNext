import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/apiAuth.js';
import { userService } from '../../../lib/services/userService.js';
import { clientService } from '../../../lib/services/clientService.js';
import { truckService } from '../../../lib/services/truckService.js';
import { repartoService } from '../../../lib/services/repartoService.js';
import { diaEntregaService } from '../../../lib/services/diaEntregaService.js';
import { clienteporRepartoService } from '../../../lib/services/clienteporRepartoService.js';

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
            result = await userService.deleteAll();
            break;
          case 'clients':
            result = await clientService.deleteAll();
            break;
          case 'trucks':
            result = await truckService.deleteAll();
            break;
          case 'repartos':
            result = await repartoService.deleteAll();
            break;
          case 'diasEntrega':
            result = await diaEntregaService.deleteAll();
            break;
          case 'clientesporReparto':
            result = await clienteporRepartoService.deleteAll();
            break;
          default:
            results[table] = { success: false, message: `Tabla ${table} no reconocida` };
            continue;
        }
        
        results[table] = { 
          success: true, 
          message: `Tabla ${table} limpiada exitosamente`,
          deletedCount: result || 0
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
    const status = {};

    const tables = ['users', 'clients', 'trucks', 'repartos', 'diasEntrega', 'clientesporReparto'];

    for (const table of tables) {
      try {
        let data;
        switch (table) {
          case 'users':
            data = await userService.getAll();
            break;
          case 'clients':
            data = await clientService.getAll();
            break;
          case 'trucks':
            data = await truckService.getAll();
            break;
          case 'repartos':
            data = await repartoService.getAll();
            break;
          case 'diasEntrega':
            data = await diaEntregaService.getAll();
            break;
          case 'clientesporReparto':
            data = await clienteporRepartoService.getAll();
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
