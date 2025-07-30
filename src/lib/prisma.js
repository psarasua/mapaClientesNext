import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

let prisma;

if (typeof window === 'undefined') {
  // Solo en el servidor, usar adaptador libSQL
  const { PrismaLibSQL } = await import('@prisma/adapter-libsql');
  const { createClient } = await import('@libsql/client');
  
  // Crear cliente libSQL para Turso
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  // Crear adaptador Prisma para libSQL
  const adapter = new PrismaLibSQL(libsql);
  
  // Configuración de Prisma con adaptador libSQL
  prisma = globalForPrisma.prisma || new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
} else {
  // En el cliente, no inicializar prisma
  prisma = null;
}

export { prisma };
export default prisma;