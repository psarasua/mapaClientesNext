// Turso Database implementation for production
import { createClient } from '@libsql/client';
import { hashPassword } from '../auth.js';

class TursoDatabase {
  constructor() {
    this.client = null;
  }

  async init() {
    if (!this.client) {
      console.log('🟡 Inicializando Turso Database...');
      
      // Validar variables de entorno
      if (!process.env.TURSO_DATABASE_URL) {
        throw new Error('TURSO_DATABASE_URL no está configurada');
      }
      
      if (!process.env.TURSO_AUTH_TOKEN) {
        throw new Error('TURSO_AUTH_TOKEN no está configurada');
      }
      
      console.log('📡 Conectando a Turso:', process.env.TURSO_DATABASE_URL);
      
      try {
        this.client = createClient({
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN,
        });

        // Probar la conexión
        await this.client.execute('SELECT 1');
        console.log('✅ Conexión a Turso establecida correctamente');

        // Crear tablas si no existen
        await this.createTables();
        
        // Inicializar datos si es necesario
        await this.seedInitialData();
        
        console.log('✅ Turso Database inicializada correctamente');
      } catch (error) {
        console.error('❌ Error al inicializar Turso:', error);
        this.client = null;
        throw error;
      }
    }
    return true;
  }

  async createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createClientsTable = `
      CREATE TABLE IF NOT EXISTS clients (
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
      )
    `;

    const createTrucksTable = `
      CREATE TABLE IF NOT EXISTS trucks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createDiasEntregaTable = `
      CREATE TABLE IF NOT EXISTS diasEntrega (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createRepartosTable = `
      CREATE TABLE IF NOT EXISTS repartos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        diasEntrega_id INTEGER NOT NULL,
        camion_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (diasEntrega_id) REFERENCES diasEntrega (id),
        FOREIGN KEY (camion_id) REFERENCES trucks (id)
      )
    `;

    const createClientesRepartoTable = `
      CREATE TABLE IF NOT EXISTS ClientesporReparto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reparto_id INTEGER NOT NULL,
        cliente_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reparto_id) REFERENCES repartos (id),
        FOREIGN KEY (cliente_id) REFERENCES clients (id)
      )
    `;

    try {
      const client = await this.ensureConnection();
      
      await client.execute(createUsersTable);
      await client.execute(createClientsTable);
      await client.execute(createTrucksTable);
      await client.execute(createRepartosTable);
      await client.execute(createDiasEntregaTable);
      await client.execute(createClientesRepartoTable);
      
      // Crear índices para optimizar consultas
      await client.execute('CREATE INDEX IF NOT EXISTS idx_clients_codigo ON clients(Codigo)');
      await client.execute('CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(Nombre)');
      await client.execute('CREATE INDEX IF NOT EXISTS idx_clients_activo ON clients(Activo)');
      
    } catch (error) {
      console.error('Error creando tablas:', error);
      throw error;
    }
  }

  // Helper para asegurar que el cliente esté inicializado
  async ensureConnection() {
    if (!this.client) {
      await this.init();
    }
    if (!this.client) {
      throw new Error('No se pudo establecer conexión con Turso');
    }
    return this.client;
  }

  // Users methods
  async getAllUsers() {
    const client = await this.ensureConnection();
    const result = await client.execute('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  async createUser(userData) {
    const client = await this.ensureConnection();
    
    // Hashear la contraseña antes de guardarla
    const hashedPassword = await hashPassword(userData.password);
    
    const result = await client.execute({
      sql: 'INSERT INTO users (usuario, password) VALUES (?, ?) RETURNING *',
      args: [userData.usuario, hashedPassword]
    });
    return result.rows[0];
  }

  // Método para obtener información de la base de datos
  getDatabaseInfo() {
    return {
      type: 'Turso',
      status: this.client ? 'connected' : 'disconnected',
      url: process.env.TURSO_DATABASE_URL ? 'configured' : 'missing',
      token: process.env.TURSO_AUTH_TOKEN ? 'configured' : 'missing'
    };
  }

  // Método para poblar datos iniciales
  async seedInitialData() {
    // Por ahora no poblamos datos automáticamente en Turso
    // Los datos se migrarán desde el sistema existente
    return true;
  }
}

export default TursoDatabase;
