// Validación de variables de entorno
export function validateEnvironment() {
  const requiredVars = [
    'JWT_SECRET',
    'TURSO_DATABASE_URL',
    'TURSO_AUTH_TOKEN'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Configuración de la aplicación
export const config = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },
  database: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  },
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development'
  }
}; 