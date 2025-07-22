// Script de migración corregido basado en la estructura real
const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function migrateDataFixed() {
  console.log('🚀 Iniciando migración corregida...');
  
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

    // Crear tablas con la estructura real
    await createRealTables(tursoClient);

    // Migrar cada tabla con su estructura real
    await migrateUsers(localDb, tursoClient);
    await migrateTrucks(localDb, tursoClient);
    await migrateClients(localDb, tursoClient);
    await migrateDiasEntrega(localDb, tursoClient);
    await migrateRepartos(localDb, tursoClient);
    await migrateClientesPorReparto(localDb, tursoClient);

    localDb.close();
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

async function createRealTables(client) {
  console.log('📝 Creando tablas con estructura real...');
  
  // Eliminar tablas existentes
  const dropTables = [
    'DROP TABLE IF EXISTS ClientesporReparto',
    'DROP TABLE IF EXISTS repartos', 
    'DROP TABLE IF EXISTS diasEntrega',
    'DROP TABLE IF EXISTS clients',
    'DROP TABLE IF EXISTS trucks',
    'DROP TABLE IF EXISTS users'
  ];

  for (const drop of dropTables) {
    await client.execute(drop);
  }

  // Crear tablas con la estructura exacta
  const createTables = [
    `CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      age INTEGER NOT NULL,
      phone TEXT,
      role TEXT,
      created_at DATETIME,
      updated_at DATETIME
    )`,
    `CREATE TABLE trucks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      year INTEGER,
      license_plate TEXT,
      capacity TEXT,
      status TEXT,
      created_at DATETIME,
      updated_at DATETIME
    )`,
    `CREATE TABLE clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigoalternativo TEXT,
      razonsocial TEXT,
      nombre TEXT NOT NULL,
      direccion TEXT,
      telefono TEXT,
      rut TEXT,
      activo INTEGER,
      latitud REAL,
      longitud REAL,
      created_at DATETIME,
      updated_at DATETIME
    )`,
    `CREATE TABLE diasEntrega (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descripcion TEXT NOT NULL,
      created_at DATETIME,
      updated_at DATETIME
    )`,
    `CREATE TABLE repartos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      diasEntrega_id INTEGER NOT NULL,
      camion_id INTEGER NOT NULL,
      created_at DATETIME,
      updated_at DATETIME,
      FOREIGN KEY (diasEntrega_id) REFERENCES diasEntrega (id),
      FOREIGN KEY (camion_id) REFERENCES trucks (id)
    )`,
    `CREATE TABLE ClientesporReparto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reparto_id INTEGER NOT NULL,
      cliente_id INTEGER NOT NULL,
      created_at DATETIME,
      updated_at DATETIME,
      FOREIGN KEY (reparto_id) REFERENCES repartos (id),
      FOREIGN KEY (cliente_id) REFERENCES clients (id)
    )`
  ];

  for (const table of createTables) {
    await client.execute(table);
  }
  console.log('✅ Tablas creadas con estructura real');
}

async function migrateUsers(localDb, tursoClient) {
  console.log('📤 Migrando users...');
  const data = localDb.prepare('SELECT * FROM users').all();
  
  for (const row of data) {
    await tursoClient.execute({
      sql: `INSERT INTO users (name, email, age, phone, role, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [row.name, row.email, row.age, row.phone, row.role, row.created_at, row.updated_at]
    });
  }
  console.log(`✅ ${data.length} usuarios migrados`);
}

async function migrateTrucks(localDb, tursoClient) {
  console.log('📤 Migrando trucks...');
  const data = localDb.prepare('SELECT * FROM trucks').all();
  
  for (const row of data) {
    await tursoClient.execute({
      sql: `INSERT INTO trucks (description, brand, model, year, license_plate, capacity, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [row.description, row.brand, row.model, row.year, row.license_plate, row.capacity, row.status, row.created_at, row.updated_at]
    });
  }
  console.log(`✅ ${data.length} camiones migrados`);
}

async function migrateClients(localDb, tursoClient) {
  console.log('📤 Migrando clients...');
  const data = localDb.prepare('SELECT * FROM clients').all();
  
  for (const row of data) {
    await tursoClient.execute({
      sql: `INSERT INTO clients (codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo, latitud, longitud, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [row.codigoalternativo, row.razonsocial, row.nombre, row.direccion, row.telefono, row.rut, row.activo, row.latitud, row.longitud, row.created_at, row.updated_at]
    });
  }
  console.log(`✅ ${data.length} clientes migrados`);
}

async function migrateDiasEntrega(localDb, tursoClient) {
  console.log('📤 Migrando diasEntrega...');
  const data = localDb.prepare('SELECT * FROM diasEntrega').all();
  
  for (const row of data) {
    await tursoClient.execute({
      sql: `INSERT INTO diasEntrega (descripcion, created_at, updated_at) 
            VALUES (?, ?, ?)`,
      args: [row.descripcion, row.created_at, row.updated_at]
    });
  }
  console.log(`✅ ${data.length} días de entrega migrados`);
}

async function migrateRepartos(localDb, tursoClient) {
  console.log('📤 Migrando repartos...');
  const data = localDb.prepare('SELECT * FROM repartos').all();
  
  for (const row of data) {
    await tursoClient.execute({
      sql: `INSERT INTO repartos (diasEntrega_id, camion_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?)`,
      args: [row.diasEntrega_id, row.camion_id, row.created_at, row.updated_at]
    });
  }
  console.log(`✅ ${data.length} repartos migrados`);
}

async function migrateClientesPorReparto(localDb, tursoClient) {
  console.log('📤 Migrando ClientesporReparto...');
  const data = localDb.prepare('SELECT * FROM ClientesporReparto').all();
  
  for (const row of data) {
    await tursoClient.execute({
      sql: `INSERT INTO ClientesporReparto (reparto_id, cliente_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?)`,
      args: [row.reparto_id, row.cliente_id, row.created_at, row.updated_at]
    });
  }
  console.log(`✅ ${data.length} relaciones cliente-reparto migradas`);
}

// Ejecutar migración
migrateDataFixed();
