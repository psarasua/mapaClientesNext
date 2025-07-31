#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

// Cargar variables de entorno
dotenv.config();

console.log('🗄️ PROBANDO CONEXIÓN A BASE DE DATOS');
console.log('=====================================\n');

async function testDatabaseConnection() {
  try {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      console.log('❌ Variables de entorno faltantes:');
      console.log(`   TURSO_DATABASE_URL: ${url ? 'Configurado' : 'NO CONFIGURADO'}`);
      console.log(`   TURSO_AUTH_TOKEN: ${authToken ? 'Configurado' : 'NO CONFIGURADO'}`);
      return false;
    }

    console.log('🔗 Conectando a Turso Database...');
    
    const db = createClient({
      url: url,
      authToken: authToken,
    });

    // Probar conexión con una consulta simple
    console.log('📊 Ejecutando consulta de prueba...');
    const result = await db.execute('SELECT 1 as test');
    
    console.log('✅ Conexión exitosa!');
    console.log(`   Resultado: ${JSON.stringify(result)}`);
    
    // Probar tablas existentes
    console.log('\n📋 Verificando tablas...');
    const tables = await db.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    if (tables.rows.length > 0) {
      console.log('✅ Tablas encontradas:');
      tables.rows.forEach(row => {
        console.log(`   - ${row.name}`);
      });
    } else {
      console.log('⚠️ No se encontraron tablas');
    }

    return true;
  } catch (error) {
    console.log('❌ Error de conexión:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Posible solución: Verifica TURSO_AUTH_TOKEN');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Posible solución: Verifica TURSO_DATABASE_URL');
    }
    
    return false;
  }
}

testDatabaseConnection().then(success => {
  if (success) {
    console.log('\n🎉 Base de datos funcionando correctamente!');
  } else {
    console.log('\n🔧 Revisa la configuración de Turso Database');
  }
}); 