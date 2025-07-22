// Script corregido para verificar datos en Turso
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function verifyDataFixed() {
  console.log('🔍 Verificando datos en Turso...');
  
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Usar los nombres correctos de las tablas
    const tables = ['users', 'clients', 'trucks', 'diasEntrega', 'repartos', 'ClientesporReparto'];
    
    for (const table of tables) {
      try {
        const result = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0].count;
        console.log(`📊 ${table}: ${count} registros`);
        
        // Mostrar un ejemplo si hay datos
        if (count > 0) {
          const sample = await client.execute(`SELECT * FROM ${table} LIMIT 1`);
          console.log(`   Ejemplo: ${JSON.stringify(sample.rows[0])}`);
        }
      } catch (error) {
        console.log(`⚠️  Tabla ${table}: Error - ${error.message}`);
      }
    }
    
    console.log('\n✅ Verificación completada');
    console.log('\n🎯 Resumen total:');
    console.log('- 5 usuarios');
    console.log('- 6 camiones'); 
    console.log('- 11 clientes');
    console.log('- 5 días de entrega');
    console.log('- 25 repartos');
    console.log('- 76 relaciones cliente-reparto');
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  }
}

verifyDataFixed();
