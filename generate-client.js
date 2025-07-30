#!/usr/bin/env node

// Script para forzar regeneración de Prisma sin Data Proxy
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Regenerando cliente Prisma SIN Data Proxy...');

// Asegurar que no se use Data Proxy
process.env.PRISMA_GENERATE_DATAPROXY = 'false';

// Limpiar completamente el cliente existente
const prismaDir = path.join(process.cwd(), 'node_modules', '.prisma');
if (fs.existsSync(prismaDir)) {
  try {
    fs.rmSync(prismaDir, { recursive: true, force: true });
    console.log('✅ Cliente Prisma anterior eliminado');
  } catch (error) {
    console.log('⚠️ Error eliminando cliente anterior:', error.message);
  }
} else {
  console.log('ℹ️ No había cliente anterior');
}

// Regenerar cliente sin Data Proxy
try {
  console.log('🔧 Generando cliente Prisma...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_GENERATE_DATAPROXY: 'false'
    }
  });
  console.log('✅ Cliente Prisma regenerado exitosamente SIN Data Proxy');
} catch (error) {
  console.error('❌ Error regenerando cliente:', error.message);
  process.exit(1);
}
