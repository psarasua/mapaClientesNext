import { PrismaClient } from '@prisma/client';

// Configuración automática de la base de datos según el entorno
const getDatabaseUrl = () => {
  // En producción, usar Turso
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  }
  // En desarrollo, usar SQLite local
  return process.env.DATABASE_URL || 'file:./data/users.db';
};

// Configuración de Prisma según el entorno
const getPrismaConfig = () => {
  const databaseUrl = getDatabaseUrl();
  
  const config = {
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  };

  // Si estamos usando Turso en producción, configurar la URL dinámicamente
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    config.datasources = {
      db: {
        url: databaseUrl
      }
    };
  }

  return config;
};

// Instancia global de Prisma para evitar múltiples conexiones
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient(getPrismaConfig());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Función para cerrar la conexión (útil en tests y producción)
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export default prisma;
