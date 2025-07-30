import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar configuración de Turso
dotenv.config({ path: '.env.turso' });

const prisma = new PrismaClient();

async function checkProductionDatabase() {
  try {
    console.log('🌐 Conectando a la base de datos de PRODUCCIÓN (Turso)...');
    console.log(`📍 URL: ${process.env.DATABASE_URL}`);
    console.log('');

    // Verificar conexión
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión establecida correctamente\n');

    // Verificar usuarios
    const users = await prisma.user.findMany();
    console.log(`👤 Usuarios en PRODUCCIÓN: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.usuario} (ID: ${user.id})`);
    });

    // Verificar camiones
    const trucks = await prisma.truck.findMany();
    console.log(`\n🚛 Camiones en PRODUCCIÓN: ${trucks.length}`);
    trucks.forEach(truck => {
      console.log(`   - ${truck.description} (ID: ${truck.id})`);
    });

    // Verificar clientes
    const clients = await prisma.client.findMany();
    console.log(`\n👥 Clientes en PRODUCCIÓN: ${clients.length}`);
    clients.slice(0, 5).forEach(client => {
      console.log(`   - ${client.Nombre} (Código: ${client.Codigo})`);
    });
    if (clients.length > 5) {
      console.log(`   ... y ${clients.length - 5} más`);
    }

    // Verificar días de entrega
    const diasEntrega = await prisma.diaEntrega.findMany();
    console.log(`\n📅 Días de entrega en PRODUCCIÓN: ${diasEntrega.length}`);
    diasEntrega.forEach(dia => {
      console.log(`   - ${dia.descripcion} (ID: ${dia.id})`);
    });

    // Verificar repartos
    const repartos = await prisma.reparto.findMany();
    console.log(`\n📦 Repartos en PRODUCCIÓN: ${repartos.length}`);
    if (repartos.length > 0) {
      repartos.slice(0, 3).forEach(reparto => {
        console.log(`   - Reparto ID: ${reparto.id} (Día: ${reparto.diasEntrega_id}, Camión: ${reparto.camion_id})`);
      });
      if (repartos.length > 3) {
        console.log(`   ... y ${repartos.length - 3} más`);
      }
    }

    // Verificar asignaciones cliente-reparto
    const clientesporReparto = await prisma.clienteporReparto.findMany();
    console.log(`\n🔗 Asignaciones cliente-reparto en PRODUCCIÓN: ${clientesporReparto.length}`);
    if (clientesporReparto.length > 0) {
      clientesporReparto.slice(0, 3).forEach(asignacion => {
        console.log(`   - Cliente ${asignacion.cliente_id} → Reparto ${asignacion.reparto_id}`);
      });
      if (clientesporReparto.length > 3) {
        console.log(`   ... y ${clientesporReparto.length - 3} más`);
      }
    }

    console.log('\n✅ Verificación de PRODUCCIÓN completada.');

  } catch (error) {
    console.error('❌ Error conectando a la base de datos de producción:', error.message);
    console.error('💡 Posibles causas:');
    console.error('   - Token de Turso expirado');
    console.error('   - URL de base de datos incorrecta');
    console.error('   - Problemas de conectividad');
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionDatabase();
