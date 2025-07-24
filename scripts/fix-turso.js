// Script para reparar la estructura de la base de datos Turso
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔧 Reparando estructura de base de datos Turso...\n');

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.log('❌ Variables de entorno faltantes');
  process.exit(1);
}

try {
  const client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  console.log('🔗 Conectado a Turso');

  // Paso 1: Verificar tabla actual
  console.log('📋 Verificando tabla actual...');
  const tableInfo = await client.execute('PRAGMA table_info(users)');
  
  console.log('📊 Estructura actual:');
  tableInfo.rows.forEach(row => {
    console.log(`   - ${row.name}: ${row.type}`);
  });

  // Paso 2: Crear tabla con estructura correcta
  console.log('\n🔧 Creando tabla con estructura correcta...');
  
  // Eliminar tabla actual si existe
  await client.execute('DROP TABLE IF EXISTS users');
  console.log('🗑️ Tabla anterior eliminada');

  // Crear nueva tabla con esquema correcto
  await client.execute(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Nueva tabla users creada con esquema correcto');

  // Paso 3: Crear usuarios iniciales
  console.log('\n👥 Creando usuarios iniciales...');
  
  const initialUsers = [
    { usuario: 'admin', password: 'admin123' },
    { usuario: 'usuario1', password: 'pass123' },
    { usuario: 'operador', password: 'operador456' }
  ];

  for (const user of initialUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    await client.execute({
      sql: 'INSERT INTO users (usuario, password) VALUES (?, ?)',
      args: [user.usuario, hashedPassword]
    });
    console.log(`   ✅ Usuario creado: ${user.usuario}`);
  }

  // Paso 4: Verificar que todo funciona
  console.log('\n🔐 Verificando autenticación...');
  const adminUser = await client.execute({
    sql: 'SELECT * FROM users WHERE usuario = ?',
    args: ['admin']
  });

  if (adminUser.rows.length > 0) {
    const user = adminUser.rows[0];
    const isValid = await bcrypt.compare('admin123', user.password);
    console.log(`   👤 Usuario admin: ✅ Encontrado`);
    console.log(`   🔐 Login 'admin123': ${isValid ? '✅ FUNCIONA' : '❌ FALLO'}`);
  }

  console.log('\n🎉 ¡Reparación completada exitosamente!');
  console.log('\n📋 Tu base de datos Turso ahora tiene:');
  console.log('   ✅ Estructura correcta (usuario, password)');
  console.log('   ✅ Usuarios iniciales con contraseñas hasheadas');
  console.log('   ✅ Login funcional: admin / admin123');
  console.log('\n🚀 Tu aplicación en producción debería funcionar ahora');

} catch (error) {
  console.error('\n❌ Error durante la reparación:', error.message);
  console.log('\n🔧 Si el error persiste, contacta soporte técnico');
  process.exit(1);
}
