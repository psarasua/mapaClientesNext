import { PrismaClient } from '@prisma/client';

// Configuración simple que debería funcionar directamente con libSQL
const globalForPrisma = globalThis;

// Configuración directa sin complicaciones
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;