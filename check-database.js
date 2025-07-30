import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseContent() {
  try {
    console.log('🔍 Verificando contenido de la base de datos...\n');

    // Verificar usuarios
    const users = await prisma.user.findMany();
    console.log(`👤 Usuarios: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.usuario} (ID: ${user.id})`);
    });

    // Verificar camiones
    const trucks = await prisma.truck.findMany();
    console.log(`\n🚛 Camiones: ${trucks.length}`);
    trucks.forEach(truck => {
      console.log(`   - ${truck.description} (ID: ${truck.id})`);
    });

    // Verificar clientes
    const clients = await prisma.client.findMany();
    console.log(`\n👥 Clientes: ${clients.length}`);
    clients.slice(0, 5).forEach(client => {
      console.log(`   - ${client.Nombre} (Código: ${client.Codigo})`);
    });
    if (clients.length > 5) {
      console.log(`   ... y ${clients.length - 5} más`);
    }

    // Verificar días de entrega
    const diasEntrega = await prisma.diaEntrega.findMany();
    console.log(`\n📅 Días de entrega: ${diasEntrega.length}`);
    diasEntrega.forEach(dia => {
      console.log(`   - ${dia.descripcion} (ID: ${dia.id})`);
    });

    // Verificar repartos
    const repartos = await prisma.reparto.findMany();
    console.log(`\n📦 Repartos: ${repartos.length}`);
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
    console.log(`\n🔗 Asignaciones cliente-reparto: ${clientesporReparto.length}`);
    if (clientesporReparto.length > 0) {
      clientesporReparto.slice(0, 3).forEach(asignacion => {
        console.log(`   - Cliente ${asignacion.cliente_id} → Reparto ${asignacion.reparto_id}`);
      });
      if (clientesporReparto.length > 3) {
        console.log(`   ... y ${clientesporReparto.length - 3} más`);
      }
    }

    console.log('\n✅ Verificación completada.');

  } catch (error) {
    console.error('❌ Error verificando la base de datos:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseContent();
