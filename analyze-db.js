// Script para analizar la estructura de SQLite local
const Database = require('better-sqlite3');

function analyzeDatabase() {
  console.log('🔍 Analizando estructura de SQLite local...');
  
  try {
    const db = new Database('./data/users.db');
    
    // Obtener todas las tablas
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();

    console.log(`📊 Tablas encontradas: ${tables.length}`);
    
    for (const table of tables) {
      const tableName = table.name;
      console.log(`\n📋 Tabla: ${tableName}`);
      
      // Obtener estructura de la tabla
      const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
      console.log('   Columnas:');
      columns.forEach(col => {
        console.log(`   - ${col.name} (${col.type}) ${col.pk ? '[PRIMARY KEY]' : ''} ${col.notnull ? '[NOT NULL]' : ''}`);
      });
      
      // Obtener número de registros
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
      console.log(`   Registros: ${count.count}`);
      
      // Mostrar un ejemplo de datos
      if (count.count > 0) {
        const sample = db.prepare(`SELECT * FROM ${tableName} LIMIT 1`).get();
        console.log('   Ejemplo:', JSON.stringify(sample, null, 2));
      }
    }
    
    db.close();
    console.log('\n✅ Análisis completado');
    
  } catch (error) {
    console.error('❌ Error analizando base de datos:', error);
  }
}

analyzeDatabase();
