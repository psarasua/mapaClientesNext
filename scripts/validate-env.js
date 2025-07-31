#!/usr/bin/env node

import dotenv from 'dotenv';
import { validateEnvironment } from '../src/lib/config.js';

// Cargar variables de entorno desde .env
dotenv.config();

console.log('🔍 Validando variables de entorno...');

try {
  validateEnvironment();
  console.log('✅ Todas las variables de entorno están configuradas correctamente');
  process.exit(0);
} catch (error) {
  console.error('❌ Error en la validación:', error.message);
  console.log('\n📋 Variables requeridas:');
  console.log('  - JWT_SECRET');
  console.log('  - TURSO_DATABASE_URL');
  console.log('  - TURSO_AUTH_TOKEN');
  console.log('\n💡 Crea un archivo .env con estas variables');
  process.exit(1);
} 
