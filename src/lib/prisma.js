import { PrismaClient } from '@prisma/client';

// Configuración simple de Prisma que funciona con SQLite local y Turso
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