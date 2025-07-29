// Script para probar la conexión con Turso
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testTursoConnection() {
  try {
    console.log('🟡 Probando conexión con Turso...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Probar una consulta simple
    const result = await client.execute('SELECT 1 as test');
    console.log('✅ Conexión exitosa con Turso!');
    console.log('📊 Resultado de prueba:', result.rows);

    // Listar tablas existentes
    try {
      const tables = await client.execute(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);
      
      console.log('📋 Tablas en la base de datos:', tables.rows.map(row => row.name));
    } catch (error) {
      console.log('⚠️  No se pudieron listar las tablas (puede ser normal si la BD está vacía)');
    }

    await client.close();
    console.log('🔒 Conexión cerrada correctamente');

  } catch (error) {
    console.error('❌ Error al conectar con Turso:', error.message);
    console.error('🔍 Detalles del error:', error);
  }
}

testTursoConnection();
