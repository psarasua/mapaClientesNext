#!/usr/bin/env node

import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🔍 DIAGNÓSTICO DE VERCEL (PRODUCCIÓN)');
console.log('=======================================\n');

// 1. Verificar variables de entorno de Vercel
console.log('1️⃣ Variables de entorno de Vercel:');
const vercelVars = [
  'JWT_SECRET',
  'TURSO_DATABASE_URL', 
  'TURSO_AUTH_TOKEN',
  'NODE_ENV',
  'VERCEL_ENV'
];

let envOk = true;
vercelVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${varName.includes('SECRET') || varName.includes('TOKEN') ? '***configurado***' : value.substring(0, 30) + '...'}`);
  } else {
    console.log(`   ❌ ${varName}: NO CONFIGURADO`);
    envOk = false;
  }
});

// 2. Verificar entorno de Vercel
console.log('\n2️⃣ Entorno de Vercel:');
console.log(`   VERCEL_ENV: ${process.env.VERCEL_ENV || 'NO CONFIGURADO'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   VERCEL_URL: ${process.env.VERCEL_URL || 'NO CONFIGURADO'}`);

// 3. Verificar configuración de la app
console.log('\n3️⃣ Configuración de la aplicación:');
console.log(`   Base URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`);
console.log(`   Database URL: ${process.env.TURSO_DATABASE_URL ? 'Configurado' : 'NO CONFIGURADO'}`);

// 4. Resumen para Vercel
console.log('\n📊 RESUMEN PARA VERCEL:');
if (envOk) {
  console.log('   ✅ Variables de entorno: OK');
} else {
  console.log('   ❌ Variables de entorno: PROBLEMAS DETECTADOS');
  console.log('\n💡 SOLUCIONES PARA VERCEL:');
  console.log('   1. Ve a Vercel Dashboard > Tu Proyecto > Settings > Environment Variables');
  console.log('   2. Agrega las variables faltantes:');
  console.log('      - JWT_SECRET (string)');
  console.log('      - TURSO_DATABASE_URL (string)');
  console.log('      - TURSO_AUTH_TOKEN (string)');
  console.log('   3. Redeploy después de agregar las variables');
}

console.log('\n🔧 PRÓXIMOS PASOS:');
console.log('   1. Revisa los logs en Vercel Dashboard > Deployments > Latest');
console.log('   2. Verifica que las variables estén en el entorno correcto (Production)');
console.log('   3. Si agregas variables, haz un nuevo deploy'); 