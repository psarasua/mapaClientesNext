#!/usr/bin/env node

// Script para forzar regeneración de Prisma sin Data Proxy
const { execSync } = require('child_process');

console.log('🔄 Regenerando cliente Prisma...');

// Limpiar cliente existente
try {
  execSync('rm -rf node_modules/.prisma', { stdio: 'inherit' });
  console.log('✅ Cliente anterior eliminado');
} catch (error) {
  console.log('ℹ️ No había cliente anterior');
}

// Regenerar cliente
try {
  execSync('npx prisma generate --no-engine', { stdio: 'inherit' });
  console.log('✅ Cliente regenerado exitosamente');
} catch (error) {
  console.error('❌ Error regenerando cliente:', error.message);
  process.exit(1);
}
