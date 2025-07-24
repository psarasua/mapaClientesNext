// Script para diagnosticar problemas específicos de importación
import dotenv from 'dotenv';

console.log('🔍 Diagnosticando problemas de importación...\n');

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function testIndividualImports() {
  console.log('1️⃣ Probando importación de DatabaseAdapter...');
  try {
    const { default: DatabaseAdapter } = await import('../src/lib/database/adapter.js');
    console.log('   ✅ DatabaseAdapter importado correctamente');
    
    console.log('2️⃣ Creando instancia de DatabaseAdapter...');
    const db = new DatabaseAdapter();
    console.log('   ✅ DatabaseAdapter instanciado correctamente');
    
  } catch (error) {
    console.error('   ❌ Error con DatabaseAdapter:', error.message);
    console.error('   📋 Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
  }

  console.log('\n3️⃣ Probando importación de funciones de auth...');
  try {
    const { verifyPassword, generateToken } = await import('../src/lib/auth.js');
    console.log('   ✅ Funciones de auth importadas correctamente');
    
    console.log('4️⃣ Probando generateToken...');
    const testUser = { id: 1, usuario: 'test' };
    const token = generateToken(testUser);
    console.log(`   ✅ Token generado: ${token.substring(0, 50)}...`);
    
  } catch (error) {
    console.error('   ❌ Error con funciones de auth:', error.message);
    console.error('   📋 Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
  }

  console.log('\n5️⃣ Probando importación de bcrypt...');
  try {
    const bcrypt = await import('bcryptjs');
    console.log('   ✅ bcrypt importado correctamente');
    
    const hash = await bcrypt.default.hash('test123', 12);
    console.log(`   ✅ Hash generado: ${hash.substring(0, 20)}...`);
    
    const isValid = await bcrypt.default.compare('test123', hash);
    console.log(`   ✅ Verificación: ${isValid}`);
    
  } catch (error) {
    console.error('   ❌ Error con bcrypt:', error.message);
    console.error('   📋 Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
  }

  console.log('\n6️⃣ Probando importación de jwt...');
  try {
    const jwt = await import('jsonwebtoken');
    console.log('   ✅ jsonwebtoken importado correctamente');
    
    const token = jwt.default.sign({ test: true }, 'secret', { expiresIn: '1h' });
    console.log(`   ✅ JWT generado: ${token.substring(0, 50)}...`);
    
  } catch (error) {
    console.error('   ❌ Error con jsonwebtoken:', error.message);
    console.error('   📋 Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
  }

  console.log('\n7️⃣ Probando @libsql/client...');
  try {
    const { createClient } = await import('@libsql/client');
    console.log('   ✅ @libsql/client importado correctamente');
    
    // Solo probar si tenemos las variables de entorno
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
      console.log('   🔗 Probando conexión a Turso...');
      const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      
      const result = await client.execute('SELECT 1 as test');
      console.log(`   ✅ Conexión a Turso exitosa: ${JSON.stringify(result.rows)}`);
    } else {
      console.log('   ⚠️ Variables de entorno de Turso no disponibles');
    }
    
  } catch (error) {
    console.error('   ❌ Error con @libsql/client:', error.message);
    console.error('   📋 Stack:', error.stack?.split('\n').slice(0, 5).join('\n'));
  }
}

console.log('🚀 Iniciando diagnóstico de importaciones...\n');
testIndividualImports()
  .then(() => {
    console.log('\n✅ Diagnóstico de importaciones completado');
  })
  .catch(error => {
    console.error('\n💥 Error fatal en diagnóstico:', error);
  });
