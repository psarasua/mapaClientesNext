import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createRepartos() {
  try {
    console.log('🚚 Creando repartos automáticamente...');

    // Obtener todos los días y camiones
    const diasEntrega = await prisma.diaEntrega.findMany();
    const camiones = await prisma.truck.findMany();

    console.log(`📅 Días disponibles: ${diasEntrega.length}`);
    console.log(`🚛 Camiones disponibles: ${camiones.length}`);

    let repartosCreados = 0;

    // Crear un reparto para cada combinación día-camión
    for (const dia of diasEntrega) {
      for (const camion of camiones) {
        try {
          await prisma.reparto.create({
            data: {
              diasEntrega_id: dia.id,
              camion_id: camion.id
            }
          });
          repartosCreados++;
        } catch (error) {
          // Si ya existe, lo ignoramos
          if (!error.message.includes('Unique constraint')) {
            console.log(`⚠️  Error creando reparto día ${dia.id} - camión ${camion.id}:`, error.message);
          }
        }
      }
    }

    console.log(`✅ ${repartosCreados} repartos creados exitosamente!`);

    // Mostrar resumen final
    const totalRepartos = await prisma.reparto.count();
    console.log(`📦 Total de repartos en la base de datos: ${totalRepartos}`);

  } catch (error) {
    console.error('❌ Error creando repartos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRepartos();
