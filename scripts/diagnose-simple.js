// Diagnóstico simple de Turso
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔍 Iniciando diagnóstico de Turso...\n');

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

console.log('🔧 Variables de entorno:');
console.log(`   TURSO_DATABASE_URL: ${TURSO_DATABASE_URL ? '✅ Configurada' : '❌ Faltante'}`);
console.log(`   TURSO_AUTH_TOKEN: ${TURSO_AUTH_TOKEN ? '✅ Configurada' : '❌ Faltante'}\n`);

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.log('❌ Variables de entorno faltantes. No se puede continuar.');
  process.exit(1);
}

try {
  console.log('🔗 Conectando a Turso...');
  
  const client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  console.log('✅ Conexión establecida\n');

  // Verificar si la tabla users existe
  console.log('📋 Verificando tabla users...');
  
  try {
    const result = await client.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="users"');
    
    if (result.rows.length === 0) {
      console.log('❌ Tabla users no existe. Creándola...');
      
      await client.execute(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla users creada exitosamente');
    } else {
      console.log('✅ Tabla users existe');
    }

    // Verificar estructura de la tabla
    const tableInfo = await client.execute('PRAGMA table_info(users)');
    console.log('\n📊 Estructura de la tabla users:');
    tableInfo.rows.forEach(row => {
      console.log(`   - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
    });

    // Verificar usuarios existentes
    console.log('\n👥 Verificando usuarios...');
    const users = await client.execute('SELECT usuario, created_at FROM users');
    
    if (users.rows.length === 0) {
      console.log('❌ No hay usuarios. Creando usuario admin...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await client.execute({
        sql: 'INSERT INTO users (usuario, password) VALUES (?, ?)',
        args: ['admin', hashedPassword]
      });
      
      console.log('✅ Usuario admin creado exitosamente');
    } else {
      console.log(`✅ ${users.rows.length} usuarios encontrados:`);
      users.rows.forEach(user => {
        console.log(`   - ${user.usuario} (creado: ${user.created_at})`);
      });
    }

    // Probar autenticación
    console.log('\n🔐 Probando autenticación del usuario admin...');
    const adminUser = await client.execute({
      sql: 'SELECT * FROM users WHERE usuario = ?',
      args: ['admin']
    });

    if (adminUser.rows.length > 0) {
      const user = adminUser.rows[0];
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log(`   ✅ Usuario admin encontrado`);
      console.log(`   🔐 Autenticación con 'admin123': ${isValid ? '✅ ÉXITO' : '❌ FALLO'}`);
      
      if (!isValid) {
        console.log('🔧 Contraseña incorrecta. Actualizando...');
        const newHash = await bcrypt.hash('admin123', 12);
        await client.execute({
          sql: 'UPDATE users SET password = ? WHERE usuario = ?',
          args: [newHash, 'admin']
        });
        console.log('✅ Contraseña actualizada');
      }
    } else {
      console.log('❌ Usuario admin no encontrado');
    }

    console.log('\n🎉 Diagnóstico completado exitosamente');
    console.log('\n📋 Tu base de datos Turso está lista para el login con:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');

  } catch (dbError) {
    console.error('❌ Error con la base de datos:', dbError.message);
    throw dbError;
  }

} catch (error) {
  console.error('\n❌ Error durante el diagnóstico:', error.message);
  console.log('\n🔧 Posibles causas:');
  console.log('1. URL o token de Turso incorrectos');
  console.log('2. Problemas de conectividad');
  console.log('3. Límites de cuenta Turso excedidos');
  process.exit(1);
}
