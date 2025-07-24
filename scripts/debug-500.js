// Verificar diferencias entre desarrollo y producción
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔍 Verificando comportamiento producción vs desarrollo...\n');

async function testProductionBehavior() {
  // Simular entorno de producción
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  console.log('🌍 Simulando entorno de producción...');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   TURSO_DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? '✅' : '❌'}`);
  console.log(`   TURSO_AUTH_TOKEN: ${process.env.TURSO_AUTH_TOKEN ? '✅' : '❌'}\n`);

  try {
    // Probar conexión directa a Turso
    console.log('🔗 Probando conexión directa a Turso...');
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Probar operaciones básicas
    console.log('📊 Probando operaciones básicas...');
    
    // 1. Listar usuarios
    const users = await client.execute('SELECT usuario FROM users');
    console.log(`   ✅ Consulta SELECT: ${users.rows.length} usuarios encontrados`);

    // 2. Buscar usuario admin
    const adminUser = await client.execute({
      sql: 'SELECT * FROM users WHERE usuario = ?',
      args: ['admin']
    });
    console.log(`   ✅ Consulta parametrizada: Usuario admin ${adminUser.rows.length > 0 ? 'encontrado' : 'no encontrado'}`);

    // 3. Verificar contraseña
    if (adminUser.rows.length > 0) {
      const user = adminUser.rows[0];
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log(`   ✅ Verificación bcrypt: ${isValid ? 'Correcta' : 'Incorrecta'}`);
    }

    // 4. Probar inicialización como lo haría el DatabaseAdapter
    console.log('\n🔧 Simulando comportamiento del DatabaseAdapter...');
    
    // Esto es lo que hace el adapter cuando se inicializa
    console.log('   📋 Verificando si necesita crear usuarios...');
    const userCount = await client.execute('SELECT COUNT(*) as count FROM users');
    const count = userCount.rows[0].count;
    console.log(`   📊 Usuarios existentes: ${count}`);

    if (count === 0) {
      console.log('   🌱 Ejecutaría seedInitialData()');
    } else {
      console.log('   ✅ No necesita crear usuarios iniciales');
    }

    console.log('\n🎉 Todas las operaciones de Turso funcionan correctamente');

  } catch (error) {
    console.error('\n❌ Error en operaciones de Turso:', error);
    console.log('\n🔧 Este podría ser el problema del error 500');
    
    // Información adicional del error
    if (error.code) {
      console.log(`   Código de error: ${error.code}`);
    }
    if (error.message) {
      console.log(`   Mensaje: ${error.message}`);
    }
  } finally {
    // Restaurar NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  }
}

async function testDatabaseAdapter() {
  console.log('\n🔧 Probando DatabaseAdapter en modo producción...');
  
  try {
    // Simular lo que hace el DatabaseAdapter
    process.env.NODE_ENV = 'production';
    
    // Importar y probar el adaptador
    const { default: DatabaseAdapter } = await import('../src/lib/database/adapter.js');
    
    console.log('📦 DatabaseAdapter importado exitosamente');
    
    const db = new DatabaseAdapter();
    console.log('🏗️ Instancia creada');
    
    await db.init();
    console.log('✅ Inicialización exitosa');
    
    const users = await db.getAllUsers();
    console.log(`👥 Usuarios obtenidos: ${users.length}`);
    
    const adminUser = await db.getUserByUsernameOrEmail('admin');
    console.log(`🔍 Usuario admin: ${adminUser ? 'Encontrado' : 'No encontrado'}`);
    
    console.log('🎉 DatabaseAdapter funciona correctamente en modo producción');

  } catch (error) {
    console.error('\n❌ Error en DatabaseAdapter:', error);
    console.log('🚨 Este es probablemente el origen del error 500');
    
    // Mostrar stack trace para debugging
    if (error.stack) {
      console.log('\n📋 Stack trace:');
      console.log(error.stack.split('\n').slice(0, 10).join('\n'));
    }
  }
}

// Ejecutar pruebas
testProductionBehavior()
  .then(() => testDatabaseAdapter())
  .catch(console.error);
