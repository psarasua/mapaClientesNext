import { execSync } from 'child_process';

console.log('🔧 Iniciando build con variables de entorno específicas...');

try {
  // Configurar variables de entorno para el build
  const env = {
    ...process.env,
    JWT_SECRET: '953baae42573e16d0539db1bd02a243c98bbf019cfce8d1c80b936edb90cb932',
    NEXTAUTH_SECRET: '00de9d5cbf34079f435a14b2038b1151fd0559dded76913070de90744b9fb12b',
    TURSO_DATABASE_URL: 'libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io',
    TURSO_AUTH_TOKEN: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTQwNjU2OTUsImlkIjoiZWM4YmQxZDMtZjhiNS00ZTA0LTkzZmEtYjYwZmJiMjk2MjFkIiwicmlkIjoiYzZlZTViNWYtMzU2Yy00ZDJjLWE5ODYtN2NlYzJhY2I1N2VhIn0.5gE6Oaz_1vbt14MOxbP5Q_jzCeScYCHhu3DtT1GkRd9H4hmSst9_X3yoco1Vs1ID9S_gBL0rzV3zKslYKw6NCg',
    NEXT_PUBLIC_BASE_URL: 'https://mapaclientes-production.up.railway.app',
    NEXTAUTH_URL: 'https://mapaclientes-production.up.railway.app',
    NODE_ENV: 'production'
  };

  console.log('📦 Ejecutando build...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: env
  });

  console.log('✅ Build completado exitosamente!');
  
} catch (error) {
  console.error('❌ Error en el build:', error.message);
  process.exit(1);
} 