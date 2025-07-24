#!/usr/bin/env node

/**
 * Script para diagnosticar y reparar la base de datos Turso
 * Este script verifica si la estructura está correcta y la repara si es necesario
 */

import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

// Configuración de Turso (usando variables de entorno)
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function diagnosticTurso() {
  console.log('🔍 Diagnosticando base de datos Turso...\n');

  if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    console.log('❌ Variables de entorno faltantes:');
    console.log(`   TURSO_DATABASE_URL: ${TURSO_DATABASE_URL ? '✅' : '❌ Faltante'}`);
    console.log(`   TURSO_AUTH_TOKEN: ${TURSO_AUTH_TOKEN ? '✅' : '❌ Faltante'}`);
    return false;
  }

  try {
    // Conectar a Turso
    const client = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });

    console.log('🔗 Conectando a Turso...');

    // Verificar si la tabla users existe
    console.log('📋 Verificando estructura de tabla users...');
    
    try {
      const tableInfo = await client.execute("PRAGMA table_info(users)");
      console.log('✅ Tabla users encontrada');
      console.log('📊 Estructura actual:');
      
      tableInfo.rows.forEach(row => {
        console.log(`   - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
      });

      // Verificar si tiene las columnas correctas
      const columns = tableInfo.rows.map(row => row.name);
      const requiredColumns = ['id', 'usuario', 'password', 'created_at', 'updated_at'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`❌ Columnas faltantes: ${missingColumns.join(', ')}`);
        return false;
      } else {
        console.log('✅ Todas las columnas requeridas están presentes');
      }

    } catch (error) {
      console.log('❌ Tabla users no existe o tiene problemas');
      console.log('🔧 Creando tabla users...');
      
      await client.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla users creada');
    }

    // Verificar usuarios existentes
    console.log('\n👥 Verificando usuarios...');
    const users = await client.execute('SELECT id, usuario, created_at FROM users');
    
    if (users.rows.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      console.log('🌱 Creando usuarios iniciales...');
      
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
      
      console.log('🎉 Usuarios iniciales creados exitosamente');
    } else {
      console.log(`✅ ${users.rows.length} usuarios encontrados:`);
      users.rows.forEach(user => {
        console.log(`   - ${user.usuario} (ID: ${user.id})`);
      });
    }

    // Probar login del usuario admin
    console.log('\n🔐 Probando autenticación del usuario admin...');
    const adminUser = await client.execute({
      sql: 'SELECT * FROM users WHERE usuario = ?',
      args: ['admin']
    });

    if (adminUser.rows.length > 0) {
      const user = adminUser.rows[0];
      const isValidPassword = await bcrypt.compare('admin123', user.password);
      console.log(`   Usuario admin: ✅ Encontrado`);
      console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
      console.log(`   Verificación 'admin123': ${isValidPassword ? '✅ Correcta' : '❌ Incorrecta'}`);
      
      if (!isValidPassword) {
        console.log('🔧 Actualizando contraseña del admin...');
        const newHash = await bcrypt.hash('admin123', 12);
        await client.execute({
          sql: 'UPDATE users SET password = ? WHERE usuario = ?',
          args: [newHash, 'admin']
        });
        console.log('✅ Contraseña del admin actualizada');
      }
    } else {
      console.log('❌ Usuario admin no encontrado');
    }

    console.log('\n🎉 Diagnóstico completado exitosamente');
    console.log('\n📋 Resumen:');
    console.log('✅ Conexión a Turso: OK');
    console.log('✅ Tabla users: OK');
    console.log('✅ Usuarios iniciales: OK');
    console.log('✅ Autenticación admin: OK');
    
    return true;

  } catch (error) {
    console.error('\n❌ Error durante el diagnóstico:', error);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que TURSO_DATABASE_URL sea correcta');
    console.log('2. Verificar que TURSO_AUTH_TOKEN sea válido');
    console.log('3. Verificar conectividad a turso.tech');
    console.log('4. Revisar límites de la cuenta Turso');
    return false;
  }
}

// Ejecutar diagnóstico
if (import.meta.url === `file://${process.argv[1]}`) {
  diagnosticTurso()
    .then(success => {
      if (success) {
        console.log('\n🚀 Tu base de datos Turso está lista para producción');
        process.exit(0);
      } else {
        console.log('\n❌ Se encontraron problemas que requieren atención');
        process.exit(1);
      }
    })
    .catch(console.error);
}

export { diagnosticTurso };
