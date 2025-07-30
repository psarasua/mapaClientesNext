import { PrismaClient } from '@prisma/client';

// Configuración que funciona tanto en desarrollo como producción - v2.0
const globalForPrisma = globalThis;

function createPrismaClient() {
  console.log(`🔗 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
  console.log(`🔗 PRISMA_GENERATE_DATAPROXY: ${process.env.PRISMA_GENERATE_DATAPROXY}`);
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  return client;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Función para cerrar la conexión (útil en tests y producción)
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export default prisma;