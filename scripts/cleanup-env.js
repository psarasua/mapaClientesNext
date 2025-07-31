#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

// Variables de entorno limpias y necesarias
const cleanEnvContent = `# Variables de entorno para MapaClientes

# JWT Secret (cambiar en producción)
JWT_SECRET=tu-super-secret-jwt-key-cambiar-en-produccion

# Turso Database
TURSO_DATABASE_URL=libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM5ODU5NjIsImlkIjoiZWM4YmQxZDMtZjhiNS00ZTA0LTkzZmEtYjYwZmJiMjk2MjFkIiwicmlkIjoiYzZlZTViNWYtMzU2Yy00ZDJjLWE5ODYtN2NlYzJhY2I1N2VhIn0.BpqTHAqmCbVSLIGzuOmubHIvD9biNdqmFL8MhRro9jseimhsso-VUifXD__W13SXMnFjXDeIRCzs41CJQ0b7Cg

# Configuración de la aplicación
NODE_ENV=development
`;

try {
  fs.writeFileSync(envPath, cleanEnvContent);
  console.log('✅ Archivo .env limpiado exitosamente');
  console.log('🗑️ Variables eliminadas:');
  console.log('  - NEXT_PUBLIC_BASE_URL (no necesaria)');
  console.log('  - NEXT_PUBLIC_APP_NAME (no necesaria)');
  console.log('  - NEXT_PUBLIC_APP_VERSION (no necesaria)');
  console.log('\n📋 Variables mantenidas:');
  console.log('  - JWT_SECRET');
  console.log('  - TURSO_DATABASE_URL');
  console.log('  - TURSO_AUTH_TOKEN');
  console.log('  - NODE_ENV');
} catch (error) {
  console.error('❌ Error limpiando .env:', error.message);
} 