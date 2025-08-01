import crypto from 'crypto';

console.log('🔐 Generando valores seguros para Railway...\n');

// Generar JWT_SECRET
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log(`JWT_SECRET=${jwtSecret}`);

// Generar NEXTAUTH_SECRET
const nextAuthSecret = crypto.randomBytes(32).toString('hex');
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);

console.log('\n📋 Copia estos valores y pégalos en Railway:');
console.log('1. Ve a https://railway.app/dashboard');
console.log('2. Selecciona tu proyecto "mapaclientes"');
console.log('3. Ve a la pestaña "Variables"');
console.log('4. Agrega las variables con los valores generados arriba');

console.log('\n🔧 Otras variables que necesitas configurar:');
console.log('TURSO_DATABASE_URL=libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io');
console.log('TURSO_AUTH_TOKEN=tu_token_de_turso_aqui');
console.log('NEXT_PUBLIC_BASE_URL=https://tu-app.railway.app');
console.log('NEXTAUTH_URL=https://tu-app.railway.app');

console.log('\n✅ Una vez configuradas todas las variables, ejecuta:');
console.log('npm run deploy:railway'); 