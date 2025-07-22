// Script para migrar datos de SQLite local a Turso
const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function migrateData() {
  console.log('🚀 Iniciando migración de datos...');
  
  try {
    // Conectar a SQLite local
    const localDb = new Database('./data/users.db');
    console.log('✅ Conectado a SQLite local');

    // Conectar a Turso
    const tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    console.log('✅ Conectado a Turso');

    // Crear tablas en Turso si no existen
    await createTursoTables(tursoClient);

    // Migrar cada tabla
    await migrateTable(localDb, tursoClient, 'users');
    await migrateTable(localDb, tursoClient, 'clients');
    await migrateTable(localDb, tursoClient, 'trucks');
    await migrateTable(localDb, tursoClient, 'repartos');
    await migrateTable(localDb, tursoClient, 'dias_entrega');
    await migrateTable(localDb, tursoClient, 'clientes_reparto');

    localDb.close();
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

async function createTursoTables(client) {
  console.log('📝 Creando tablas en Turso...');
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS trucks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate TEXT UNIQUE NOT NULL,
      driver TEXT NOT NULL,
      capacity REAL,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS repartos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      truck_id INTEGER,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (truck_id) REFERENCES trucks (id)
    )`,
    `CREATE TABLE IF NOT EXISTS dias_entrega (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reparto_id INTEGER NOT NULL,
      delivery_date DATE NOT NULL,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reparto_id) REFERENCES repartos (id)
    )`,
    `CREATE TABLE IF NOT EXISTS clientes_reparto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      reparto_id INTEGER NOT NULL,
      order_number INTEGER,
      delivery_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients (id),
      FOREIGN KEY (reparto_id) REFERENCES repartos (id)
    )`
  ];

  for (const table of tables) {
    await client.execute(table);
  }
  console.log('✅ Tablas creadas en Turso');
}

async function migrateTable(localDb, tursoClient, tableName) {
  try {
    // Verificar si la tabla existe en SQLite local
    const tableExists = localDb.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name=?
    `).get(tableName);

    if (!tableExists) {
      console.log(`⚠️  Tabla ${tableName} no existe en SQLite local, saltando...`);
      return;
    }

    // Obtener datos de SQLite local
    const localData = localDb.prepare(`SELECT * FROM ${tableName}`).all();
    
    if (localData.length === 0) {
      console.log(`ℹ️  Tabla ${tableName} está vacía, saltando...`);
      return;
    }

    console.log(`📤 Migrando ${localData.length} registros de ${tableName}...`);

    // Limpiar tabla en Turso primero
    await tursoClient.execute(`DELETE FROM ${tableName}`);

    // Obtener columnas de la tabla
    const columns = Object.keys(localData[0]).filter(col => col !== 'id');
    const placeholders = columns.map(() => '?').join(', ');
    const columnNames = columns.join(', ');

    // Insertar datos en Turso
    for (const row of localData) {
      const values = columns.map(col => row[col]);
      await tursoClient.execute({
        sql: `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
        args: values
      });
    }

    console.log(`✅ Tabla ${tableName} migrada exitosamente (${localData.length} registros)`);
    
  } catch (error) {
    console.error(`❌ Error migrando tabla ${tableName}:`, error);
  }
}

// Ejecutar migración
migrateData();
