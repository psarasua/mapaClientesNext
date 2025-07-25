import { PrismaClient } from '@prisma/client';

// Instancia global de Prisma para evitar múltiples conexiones
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Función para cerrar la conexión (útil en tests y producción)
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export default prisma;
