import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Configurando variables de entorno para Railway...');

try {
  // Verificar que Railway CLI esté disponible
  execSync('railway --version', { stdio: 'inherit' });

  console.log('📝 Configurando variables de entorno...');
  
  // Variables que necesitas configurar manualmente
  const variables = [
    'JWT_SECRET',
    'TURSO_DATABASE_URL', 
    'TURSO_AUTH_TOKEN',
    'NEXT_PUBLIC_BASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ];

  console.log('\n🚨 IMPORTANTE: Necesitas configurar estas variables en Railway:');
  console.log('1. Ve a https://railway.app/dashboard');
  console.log('2. Selecciona tu proyecto "mapaclientes"');
  console.log('3. Ve a la pestaña "Variables"');
  console.log('4. Agrega las siguientes variables:\n');

  variables.forEach((variable, index) => {
    console.log(`${index + 1}. ${variable}`);
  });

  console.log('\n📋 Valores sugeridos:');
  console.log('JWT_SECRET: Un string aleatorio y seguro');
  console.log('TURSO_DATABASE_URL: libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io');
  console.log('TURSO_AUTH_TOKEN: Tu token de Turso');
  console.log('NEXT_PUBLIC_BASE_URL: https://tu-app.railway.app');
  console.log('NEXTAUTH_URL: https://tu-app.railway.app');
  console.log('NEXTAUTH_SECRET: Un string aleatorio y seguro');

  console.log('\n✅ Una vez configuradas las variables, ejecuta:');
  console.log('npm run deploy:railway');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 