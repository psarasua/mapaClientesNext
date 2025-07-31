#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

// Leer el archivo .env actual
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Error leyendo archivo .env:', error.message);
  process.exit(1);
}

// Actualizar la URL de Turso
const updatedContent = envContent.replace(
  /TURSO_DATABASE_URL=.*/,
  'TURSO_DATABASE_URL=libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io'
);

try {
  fs.writeFileSync(envPath, updatedContent);
  console.log('✅ URL de Turso actualizada correctamente');
  console.log('🔗 URL: libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io');
  console.log('📝 IMPORTANTE: Ahora necesitas agregar el TURSO_AUTH_TOKEN');
  console.log('💡 Obtén tu token en: https://dashboard.turso.tech/');
} catch (error) {
  console.error('❌ Error actualizando .env:', error.message);
} 