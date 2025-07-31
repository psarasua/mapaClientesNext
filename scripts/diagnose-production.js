#!/usr/bin/env node

import dotenv from 'dotenv';
import { config } from '../src/lib/config.js';

// Cargar variables de entorno
dotenv.config();

console.log('🔍 DIAGNÓSTICO DE PRODUCCIÓN');
console.log('==============================\n');

// 1. Verificar variables de entorno
console.log('1️⃣ Verificando variables de entorno:');
const requiredVars = ['JWT_SECRET', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'];
let envOk = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${varName.includes('SECRET') ? '***configurado***' : value.substring(0, 20) + '...'}`);
  } else {
    console.log(`   ❌ ${varName}: NO CONFIGURADO`);
    envOk = false;
  }
});

// 2. Verificar configuración de la app
console.log('\n2️⃣ Configuración de la aplicación:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   BASE_URL: ${config.app.baseUrl}`);
console.log(`   Database URL: ${config.database.url ? 'Configurado' : 'NO CONFIGURADO'}`);

// 3. Verificar archivos críticos
console.log('\n3️⃣ Verificando archivos críticos:');
import fs from 'fs';
import path from 'path';

const criticalFiles = [
  'package.json',
  'next.config.mjs',
  'vercel.json',
  'src/lib/config.js',
  'src/lib/database.js'
];

criticalFiles.forEach(file => {
  try {
    fs.accessSync(file);
    console.log(`   ✅ ${file}: Existe`);
  } catch (error) {
    console.log(`   ❌ ${file}: NO EXISTE`);
  }
});

// 4. Resumen
console.log('\n📊 RESUMEN:');
if (envOk) {
  console.log('   ✅ Variables de entorno: OK');
} else {
  console.log('   ❌ Variables de entorno: PROBLEMAS DETECTADOS');
  console.log('\n💡 SOLUCIONES:');
  console.log('   1. Configura las variables en Vercel Dashboard');
  console.log('   2. Verifica que TURSO_DATABASE_URL y TURSO_AUTH_TOKEN estén correctos');
  console.log('   3. Asegúrate de que JWT_SECRET esté configurado');
}

console.log('\n🔧 PRÓXIMOS PASOS:');
console.log('   1. Ejecuta: node scripts/test-apis.js');
console.log('   2. Revisa los logs en Vercel Dashboard');
console.log('   3. Verifica la conexión a Turso Database'); 