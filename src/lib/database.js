import { createClient } from '@libsql/client';

const globalForDb = globalThis;

let db;

if (typeof window === 'undefined') {
  // Solo en el servidor
  db = globalForDb.db || createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForDb.db = db;
  }
} else {
  // En el cliente, no inicializar
  db = null;
}

export { db };
export default db;
