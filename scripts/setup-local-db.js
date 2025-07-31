#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

// Configuración para base de datos local SQLite
const localEnvContent = `# Variables de entorno para el proyecto MapaClientes

# JWT Secret (cambiar en producción)
JWT_SECRET=tu-super-secret-jwt-key-cambiar-en-produccion

# Base de datos local SQLite (alternativa a Turso)
DATABASE_URL=file:./local.db
TURSO_DATABASE_URL=file:./local.db
TURSO_AUTH_TOKEN=

# Configuración de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# Configuración adicional
NEXT_PUBLIC_APP_NAME=MapaClientes
NEXT_PUBLIC_APP_VERSION=1.0.0
`;

try {
  fs.writeFileSync(envPath, localEnvContent);
  console.log('✅ Archivo .env configurado para base de datos local SQLite');
  console.log('📝 Esto te permitirá trabajar sin configurar Turso inmediatamente');
  console.log('🗄️ La base de datos se creará automáticamente en ./local.db');
} catch (error) {
  console.error('❌ Error configurando .env:', error.message);
} 