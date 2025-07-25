import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log('🧪 Probando conexión con Prisma...');
    
    // Contar clientes
    const clienteCount = await prisma.client.count();
    console.log(`📊 Total de clientes: ${clienteCount}`);
    
    // Obtener algunos clientes de muestra
    const clientes = await prisma.client.findMany({
      take: 3,
      select: {
        id: true,
        codigo: true,
        nombre: true,
        razon: true,
        ruc: true
      }
    });
    
    console.log('👥 Clientes de muestra:');
    clientes.forEach(cliente => {
      console.log(`  - ID: ${cliente.id}, Código: ${cliente.codigo}, Nombre: ${cliente.nombre}`);
      console.log(`    Razón: ${cliente.razon || 'N/A'}, RUT: ${cliente.ruc || 'N/A'}`);
    });
    
    // Contar otras entidades
    const [userCount, truckCount, repartoCount] = await Promise.all([
      prisma.user.count(),
      prisma.truck.count(),
      prisma.reparto.count()
    ]);
    
    console.log('\n📈 Resumen de datos:');
    console.log(`  - Usuarios: ${userCount}`);
    console.log(`  - Camiones: ${truckCount}`);
    console.log(`  - Repartos: ${repartoCount}`);
    console.log(`  - Clientes: ${clienteCount}`);
    
    // Probar transformación de datos
    const clientesTransformados = clientes.map(cliente => ({
      ...cliente,
      Codigo: cliente.codigo,
      Razon: cliente.razon,
      Nombre: cliente.nombre,
      Ruc: cliente.ruc
    }));
    
    console.log('\n🔄 Transformación exitosa de nombres de campos');
    console.log('✅ Prisma funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error probando Prisma:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
