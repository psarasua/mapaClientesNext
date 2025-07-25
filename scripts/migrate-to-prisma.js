import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';

const prisma = new PrismaClient();
const oldDbPath = path.join(process.cwd(), 'data', 'users.db');
const oldDb = new Database(oldDbPath);

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos de SQLite a Prisma...');

    // 1. Migrar usuarios
    console.log('📁 Migrando usuarios...');
    const users = oldDb.prepare('SELECT * FROM users').all();
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          usuario: user.usuario,
          password: user.password,
          created_at: new Date(user.created_at),
          updated_at: new Date(user.updated_at)
        }
      });
    }
    console.log(`✅ ${users.length} usuarios migrados`);

    // 2. Migrar camiones
    console.log('🚛 Migrando camiones...');
    const trucks = oldDb.prepare('SELECT * FROM trucks').all();
    for (const truck of trucks) {
      await prisma.truck.upsert({
        where: { id: truck.id },
        update: {},
        create: {
          id: truck.id,
          description: truck.description,
          created_at: new Date(truck.created_at),
          updated_at: new Date(truck.updated_at)
        }
      });
    }
    console.log(`✅ ${trucks.length} camiones migrados`);

    // 3. Migrar clientes
    console.log('👥 Migrando clientes...');
    const clients = oldDb.prepare('SELECT * FROM clients').all();
    for (const client of clients) {
      await prisma.client.upsert({
        where: { id: client.id },
        update: {},
        create: {
          id: client.id,
          codigo: client.Codigo,
          razon: client.Razon,
          nombre: client.Nombre,
          direccion: client.Direccion,
          telefono1: client.Telefono1,
          ruc: client.Ruc,
          activo: client.Activo,
          coordenada_x: client.Coordenada_x,
          coordenada_y: client.Coordenada_y,
          created_at: new Date(client.created_at),
          updated_at: new Date(client.updated_at)
        }
      });
    }
    console.log(`✅ ${clients.length} clientes migrados`);

    // 4. Migrar días de entrega
    console.log('📅 Migrando días de entrega...');
    const diasEntrega = oldDb.prepare('SELECT * FROM diasEntrega').all();
    for (const dia of diasEntrega) {
      await prisma.diaEntrega.upsert({
        where: { id: dia.id },
        update: {},
        create: {
          id: dia.id,
          descripcion: dia.descripcion,
          created_at: new Date(dia.created_at),
          updated_at: new Date(dia.updated_at)
        }
      });
    }
    console.log(`✅ ${diasEntrega.length} días de entrega migrados`);

    // 5. Migrar repartos
    console.log('📦 Migrando repartos...');
    const repartos = oldDb.prepare('SELECT * FROM repartos').all();
    for (const reparto of repartos) {
      await prisma.reparto.upsert({
        where: { id: reparto.id },
        update: {},
        create: {
          id: reparto.id,
          diasEntrega_id: reparto.diasEntrega_id,
          camion_id: reparto.camion_id,
          created_at: new Date(reparto.created_at),
          updated_at: new Date(reparto.updated_at)
        }
      });
    }
    console.log(`✅ ${repartos.length} repartos migrados`);

    // 6. Migrar clientes por reparto
    console.log('🔗 Migrando asignaciones cliente-reparto...');
    const clientesporReparto = oldDb.prepare('SELECT * FROM ClientesporReparto').all();
    for (const asignacion of clientesporReparto) {
      await prisma.clienteporReparto.upsert({
        where: { id: asignacion.id },
        update: {},
        create: {
          id: asignacion.id,
          reparto_id: asignacion.reparto_id,
          cliente_id: asignacion.cliente_id,
          created_at: new Date(asignacion.created_at),
          updated_at: new Date(asignacion.updated_at)
        }
      });
    }
    console.log(`✅ ${clientesporReparto.length} asignaciones migradas`);

    console.log('🎉 ¡Migración completada exitosamente!');
    
    // Verificar datos migrados
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.truck.count(),
      prisma.client.count(),
      prisma.diaEntrega.count(),
      prisma.reparto.count(),
      prisma.clienteporReparto.count()
    ]);

    console.log('\n📊 Resumen de migración:');
    console.log(`- Usuarios: ${counts[0]}`);
    console.log(`- Camiones: ${counts[1]}`);
    console.log(`- Clientes: ${counts[2]}`);
    console.log(`- Días de entrega: ${counts[3]}`);
    console.log(`- Repartos: ${counts[4]}`);
    console.log(`- Asignaciones: ${counts[5]}`);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await prisma.$disconnect();
    oldDb.close();
  }
}

migrateData();
