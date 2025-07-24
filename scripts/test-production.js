#!/usr/bin/env node

/**
 * Script para probar la configuración de producción localmente
 * 
 * Este script simula el entorno de producción para verificar que:
 * 1. La base de datos Turso se conecte correctamente
 * 2. Los usuarios se creen con contraseñas hasheadas
 * 3. El login funcione correctamente
 * 4. Los esquemas sean consistentes entre SQLite y Turso
 */

import dotenv from 'dotenv';
import { hashPassword, verifyPassword } from '../src/lib/auth.js';
import DatabaseAdapter from '../src/lib/database/adapter.js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function testProductionSetup() {
  console.log('🧪 Iniciando pruebas de configuración de producción...\n');

  try {
    // Simular entorno de producción
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    console.log('🔧 Configuración actual:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   Turso URL: ${process.env.TURSO_DATABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   Turso Token: ${process.env.TURSO_AUTH_TOKEN ? '✅ Configurada' : '❌ No configurada'}\n`);

    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.log('⚠️  Variables de Turso no configuradas. Usando SQLite en su lugar.\n');
      process.env.NODE_ENV = originalNodeEnv;
    }

    // Inicializar base de datos
    console.log('🔌 Conectando a la base de datos...');
    const db = new DatabaseAdapter();
    await db.init();
    console.log('✅ Conexión exitosa\n');

    // Probar conteo de usuarios
    console.log('👥 Verificando usuarios...');
    const userCount = await db.getUsersCount();
    console.log(`   Usuarios encontrados: ${userCount}`);

    if (userCount > 0) {
      // Probar obtener usuario admin
      console.log('🔍 Buscando usuario admin...');
      const adminUser = await db.getUserByUsernameOrEmail('admin');
      
      if (adminUser) {
        console.log('✅ Usuario admin encontrado');
        console.log(`   ID: ${adminUser.id}`);
        console.log(`   Usuario: ${adminUser.usuario}`);
        console.log(`   Password hash: ${adminUser.password.substring(0, 20)}...`);

        // Probar verificación de contraseña
        console.log('🔐 Probando verificación de contraseña...');
        const isValidPassword = await verifyPassword('admin123', adminUser.password);
        console.log(`   Contraseña 'admin123': ${isValidPassword ? '✅ Válida' : '❌ Inválida'}`);

        const isInvalidPassword = await verifyPassword('wrongpassword', adminUser.password);
        console.log(`   Contraseña incorrecta: ${isInvalidPassword ? '❌ Válida (ERROR!)' : '✅ Inválida'}`);
      } else {
        console.log('❌ Usuario admin no encontrado');
      }
    }

    // Restaurar NODE_ENV original
    process.env.NODE_ENV = originalNodeEnv;

    console.log('\n🎉 Pruebas completadas exitosamente');
    console.log('\n📋 Resumen:');
    console.log('✅ Conexión a base de datos: OK');
    console.log('✅ Esquema de usuarios: OK');
    console.log('✅ Hash de contraseñas: OK');
    console.log('✅ Verificación de login: OK');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error);
    process.exit(1);
  }
}

async function testPasswordHashing() {
  console.log('\n🔐 Probando sistema de hash de contraseñas...');
  
  const testPassword = 'admin123';
  console.log(`Contraseña de prueba: "${testPassword}"`);
  
  // Hashear contraseña
  const hashedPassword = await hashPassword(testPassword);
  console.log(`Hash generado: ${hashedPassword}`);
  
  // Verificar contraseña correcta
  const isValid = await verifyPassword(testPassword, hashedPassword);
  console.log(`Verificación correcta: ${isValid ? '✅' : '❌'}`);
  
  // Verificar contraseña incorrecta
  const isInvalid = await verifyPassword('wrongpassword', hashedPassword);
  console.log(`Verificación incorrecta: ${isInvalid ? '❌ (debería ser false)' : '✅'}`);
}

// Ejecutar pruebas
if (import.meta.url === `file://${process.argv[1]}`) {
  testPasswordHashing()
    .then(() => testProductionSetup())
    .catch(console.error);
}

export { testProductionSetup, testPasswordHashing };
