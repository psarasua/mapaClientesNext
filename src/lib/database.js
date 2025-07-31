import { createClient } from '@libsql/client';
import { validateEnvironment, config } from './config.js';
import { logger } from './logger.js';

const globalForDb = globalThis;

let db;

if (typeof window === 'undefined') {
  // Validar variables de entorno en el servidor
  try {
    validateEnvironment();
  } catch (error) {
    logger.error('Error de configuración:', error.message);
    throw error;
  }

  // Solo en el servidor
  db = globalForDb.db || createClient({
    url: config.database.url,
    authToken: config.database.authToken,
  });
  
  if (config.app.nodeEnv !== 'production') {
    globalForDb.db = db;
  }
} else {
  // En el cliente, no inicializar
  db = null;
}

export { db };
export default db;
