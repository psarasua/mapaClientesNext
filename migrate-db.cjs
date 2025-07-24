const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

console.log('🔄 Iniciando migración de base de datos...');

const dbPath = path.join(__dirname, 'data', 'users.db');
const backupPath = path.join(__dirname, 'data', 'users_backup.db');

try {
  // Hacer backup si existe
  if (fs.existsSync(dbPath)) {
    console.log('📦 Creando backup de la base de datos actual...');
    fs.copyFileSync(dbPath, backupPath);
    console.log('✅ Backup creado en:', backupPath);
  }

  // Abrir la base de datos
  const db = new Database(dbPath);
  
  // Desactivar foreign keys temporalmente
  db.exec('PRAGMA foreign_keys = OFF');

  console.log('🔍 Verificando estructura actual de la tabla clients...');
  
  try {
    // Intentar obtener información de la tabla clients
    const tableInfo = db.prepare("PRAGMA table_info(clients)").all();
    console.log('📋 Columnas actuales:', tableInfo.map(col => col.name));

    // Verificar si necesitamos migrar
    const hasOldStructure = tableInfo.some(col => col.name === 'codigoalternativo');
    const hasNewStructure = tableInfo.some(col => col.name === 'Codigo');

    if (hasOldStructure && !hasNewStructure) {
      console.log('🔄 Migrando estructura antigua a nueva...');
      
      // Limpiar tabla temporal si existe
      db.exec('DROP TABLE IF EXISTS clients_new');
      
      // Crear tabla con nueva estructura
      db.exec(`
        CREATE TABLE clients_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          Codigo TEXT UNIQUE NOT NULL,
          Razon TEXT,
          Nombre TEXT NOT NULL,
          Direccion TEXT,
          Telefono1 TEXT,
          Ruc TEXT,
          Activo INTEGER DEFAULT 1,
          Coordenada_x REAL,
          Coordenada_y REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Migrar datos existentes
      const clients = db.prepare('SELECT * FROM clients').all();
      console.log(`📊 Migrando ${clients.length} clientes...`);

      const insertStmt = db.prepare(`
        INSERT INTO clients_new (id, Codigo, Razon, Nombre, Direccion, Telefono1, Ruc, Activo, Coordenada_x, Coordenada_y, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const client of clients) {
        insertStmt.run(
          client.id,
          client.codigoalternativo || `CLI${client.id}`,
          client.razonsocial || null,
          client.nombre || 'Cliente sin nombre',
          client.direccion || null,
          client.telefono || null,
          client.rut || null,
          client.activo || 1,
          client.latitud || null,
          client.longitud || null,
          client.created_at,
          client.updated_at
        );
      }

      // Eliminar tabla antigua y renombrar
      db.exec('DROP TABLE clients');
      db.exec('ALTER TABLE clients_new RENAME TO clients');

      console.log('✅ Migración de clients completada');
    } else if (hasNewStructure) {
      console.log('✅ La tabla clients ya tiene la estructura nueva');
    } else {
      console.log('🆕 Creando tabla clients con estructura nueva...');
      db.exec(`
        CREATE TABLE clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          Codigo TEXT UNIQUE NOT NULL,
          Razon TEXT,
          Nombre TEXT NOT NULL,
          Direccion TEXT,
          Telefono1 TEXT,
          Ruc TEXT,
          Activo INTEGER DEFAULT 1,
          Coordenada_x REAL,
          Coordenada_y REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Crear índices
    console.log('🔍 Creando índices...');
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_clients_Codigo ON clients(Codigo);
      CREATE INDEX IF NOT EXISTS idx_clients_Nombre ON clients(Nombre);
      CREATE INDEX IF NOT EXISTS idx_clients_Ruc ON clients(Ruc);
    `);

    console.log('✅ Migración completada exitosamente');
    
    // Reactivar foreign keys
    db.exec('PRAGMA foreign_keys = ON');
    
  } catch (error) {
    if (error.message.includes('no such table: clients')) {
      console.log('🆕 Tabla clients no existe, será creada automáticamente');
    } else {
      throw error;
    }
  }

  db.close();
  console.log('🎉 Base de datos migrada correctamente');

} catch (error) {
  console.error('❌ Error durante la migración:', error.message);
  process.exit(1);
}
