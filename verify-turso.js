// Script para verificar datos en Turso
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function verifyData() {
  console.log('🔍 Verificando datos en Turso...');
  
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const tables = ['users', 'clients', 'trucks', 'repartos', 'dias_entrega', 'clientes_reparto'];
    
    for (const table of tables) {
      try {
        const result = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0].count;
        console.log(`📊 ${table}: ${count} registros`);
      } catch (error) {
        console.log(`⚠️  Tabla ${table}: No existe o está vacía`);
      }
    }
    
    console.log('✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  }
}

verifyData();
