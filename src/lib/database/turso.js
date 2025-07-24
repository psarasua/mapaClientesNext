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
      
      this.client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });

      // Crear tablas si no existen
      await this.createTables();
      
      // Inicializar datos si es necesario
      await this.seedInitialData();
      
      console.log('✅ Turso Database inicializada correctamente');
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
        plate TEXT UNIQUE NOT NULL,
        driver TEXT NOT NULL,
        capacity REAL,
        status TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createRepartosTable = `
      CREATE TABLE IF NOT EXISTS repartos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        truck_id INTEGER,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (truck_id) REFERENCES trucks (id)
      )
    `;

    const createDiasEntregaTable = `
      CREATE TABLE IF NOT EXISTS dias_entrega (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reparto_id INTEGER NOT NULL,
        delivery_date DATE NOT NULL,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reparto_id) REFERENCES repartos (id)
      )
    `;

    const createClientesRepartoTable = `
      CREATE TABLE IF NOT EXISTS clientes_reparto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        reparto_id INTEGER NOT NULL,
        order_number INTEGER,
        delivery_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (reparto_id) REFERENCES repartos (id)
      )
    `;

    try {
      await this.client.execute(createUsersTable);
      await this.client.execute(createClientsTable);
      await this.client.execute(createTrucksTable);
      await this.client.execute(createRepartosTable);
      await this.client.execute(createDiasEntregaTable);
      await this.client.execute(createClientesRepartoTable);
      
      // Crear índices para optimizar consultas
      await this.client.execute('CREATE INDEX IF NOT EXISTS idx_clients_codigo ON clients(codigoalternativo)');
      await this.client.execute('CREATE INDEX IF NOT EXISTS idx_clients_razonsocial ON clients(razonsocial)');
      await this.client.execute('CREATE INDEX IF NOT EXISTS idx_clients_activo ON clients(activo)');
      
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  // Users methods
  async getAllUsers() {
    const result = await this.client.execute('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  async createUser(userData) {
    // Hashear la contraseña antes de guardarla
    const hashedPassword = await hashPassword(userData.password);
    
    const result = await this.client.execute({
      sql: 'INSERT INTO users (usuario, password) VALUES (?, ?) RETURNING *',
      args: [userData.usuario, hashedPassword]
    });
    return result.rows[0];
  }

  async updateUser(id, userData) {
    // Hashear la contraseña si se está actualizando
    let password = userData.password;
    if (password) {
      password = await hashPassword(password);
    }
    
    const fields = Object.keys(userData).filter(key => userData[key] !== undefined);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => field === 'password' ? password : userData[field]);
    
    const result = await this.client.execute({
      sql: `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`,
      args: [...values, id]
    });
    return result.rows[0];
  }

  async deleteUser(id) {
    const result = await this.client.execute({
      sql: 'DELETE FROM users WHERE id = ? RETURNING *',
      args: [id]
    });
    return result.rows[0];
  }

  // Clients methods
  async getAllClients() {
    const result = await this.client.execute('SELECT * FROM clients ORDER BY created_at DESC');
    return result.rows;
  }

  async createClient(clientData) {
    const result = await this.client.execute({
      sql: `INSERT INTO clients (Codigo, Razon, Nombre, Direccion, Telefono1, Ruc, Activo, Coordenada_x, Coordenada_y) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      args: [
        clientData.Codigo,
        clientData.Razon || null,
        clientData.Nombre,
        clientData.Direccion || null,
        clientData.Telefono1 || null,
        clientData.Ruc || null,
        clientData.Activo !== undefined ? parseInt(clientData.Activo) : 1,
        clientData.Coordenada_x || null,
        clientData.Coordenada_y || null
      ]
    });
    return result.rows[0];
  }

  async updateClient(id, clientData) {
    const result = await this.client.execute({
      sql: `UPDATE clients SET 
            Codigo = ?, Razon = ?, Nombre = ?, Direccion = ?, 
            Telefono1 = ?, Ruc = ?, Activo = ?, Coordenada_x = ?, Coordenada_y = ?, 
            updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? RETURNING *`,
      args: [
        clientData.Codigo,
        clientData.Razon || null,
        clientData.Nombre,
        clientData.Direccion || null,
        clientData.Telefono1 || null,
        clientData.Ruc || null,
        clientData.Activo !== undefined ? parseInt(clientData.Activo) : 1,
        clientData.Coordenada_x || null,
        clientData.Coordenada_y || null,
        id
      ]
    });
    return result.rows[0];
  }

  async deleteClient(id) {
    const result = await this.client.execute({
      sql: 'DELETE FROM clients WHERE id = ? RETURNING *',
      args: [id]
    });
    return result.rows[0];
  }

  async clearAllClients() {
    const result = await this.client.execute('DELETE FROM clients');
    return result.rowsAffected;
  }

  // Trucks methods
  async getAllTrucks() {
    const result = await this.client.execute('SELECT * FROM trucks ORDER BY created_at DESC');
    return result.rows;
  }

  async createTruck(truckData) {
    const { plate, driver, capacity, status = 'available' } = truckData;
    const result = await this.client.execute({
      sql: 'INSERT INTO trucks (plate, driver, capacity, status) VALUES (?, ?, ?, ?) RETURNING *',
      args: [plate, driver, capacity, status]
    });
    return result.rows[0];
  }

  async updateTruck(id, truckData) {
    const { plate, driver, capacity, status } = truckData;
    const result = await this.client.execute({
      sql: 'UPDATE trucks SET plate = ?, driver = ?, capacity = ?, status = ? WHERE id = ? RETURNING *',
      args: [plate, driver, capacity, status, id]
    });
    return result.rows[0];
  }

  async deleteTruck(id) {
    const result = await this.client.execute({
      sql: 'DELETE FROM trucks WHERE id = ? RETURNING *',
      args: [id]
    });
    return result.rows[0];
  }

  async clearAllTrucks() {
    const result = await this.client.execute('DELETE FROM trucks');
    return result.rowsAffected;
  }

  async seedInitialTrucks() {
    // Verificar si ya hay camiones
    const countResult = await this.client.execute('SELECT COUNT(*) as count FROM trucks');
    const count = countResult.rows[0].count;
    
    if (count > 0) {
      return;
    }

    const initialTrucks = [
      { description: 'Camión de carga pesada Volvo FH16' },
      { description: 'Camión refrigerado Mercedes Actros' },
      { description: 'Camión de distribución Scania R450' },
      { description: 'Camión urbano Iveco Stralis' },
      { description: 'Camión articulado MAN TGX' }
    ];

    for (const truck of initialTrucks) {
      try {
        await this.createTruck(truck);
      } catch (error) {
        console.error('Error creando camión inicial:', error);
      }
    }

    console.log(`🚚 Se crearon ${initialTrucks.length} camiones iniciales en Turso`);
  }

  // Repartos methods
  async getAllRepartos() {
    const result = await this.client.execute(`
      SELECT r.*, t.plate as truck_plate, t.driver as truck_driver
      FROM repartos r
      LEFT JOIN trucks t ON r.truck_id = t.id
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  }

  async createReparto(repartoData) {
    const { name, description, truck_id, status = 'pending' } = repartoData;
    const result = await this.client.execute({
      sql: 'INSERT INTO repartos (name, description, truck_id, status) VALUES (?, ?, ?, ?) RETURNING *',
      args: [name, description, truck_id, status]
    });
    return result.rows[0];
  }

  async updateReparto(id, repartoData) {
    const { name, description, truck_id, status } = repartoData;
    const result = await this.client.execute({
      sql: 'UPDATE repartos SET name = ?, description = ?, truck_id = ?, status = ? WHERE id = ? RETURNING *',
      args: [name, description, truck_id, status, id]
    });
    return result.rows[0];
  }

  async deleteReparto(id) {
    const result = await this.client.execute({
      sql: 'DELETE FROM repartos WHERE id = ? RETURNING *',
      args: [id]
    });
    return result.rows[0];
  }

  async clearAllRepartos() {
    const result = await this.client.execute('DELETE FROM repartos');
    return result.rowsAffected;
  }

  // Dias Entrega methods
  async getAllDiasEntrega() {
    const result = await this.client.execute(`
      SELECT de.*, r.name as reparto_name
      FROM dias_entrega de
      LEFT JOIN repartos r ON de.reparto_id = r.id
      ORDER BY de.delivery_date DESC
    `);
    return result.rows;
  }

  async createDiaEntrega(diaData) {
    const { reparto_id, delivery_date, status = 'scheduled', notes } = diaData;
    const result = await this.client.execute({
      sql: 'INSERT INTO dias_entrega (reparto_id, delivery_date, status, notes) VALUES (?, ?, ?, ?) RETURNING *',
      args: [reparto_id, delivery_date, status, notes]
    });
    return result.rows[0];
  }

  async updateDiaEntrega(id, diaData) {
    const { reparto_id, delivery_date, status, notes } = diaData;
    const result = await this.client.execute({
      sql: 'UPDATE dias_entrega SET reparto_id = ?, delivery_date = ?, status = ?, notes = ? WHERE id = ? RETURNING *',
      args: [reparto_id, delivery_date, status, notes, id]
    });
    return result.rows[0];
  }

  async deleteDiaEntrega(id) {
    const result = await this.client.execute({
      sql: 'DELETE FROM dias_entrega WHERE id = ? RETURNING *',
      args: [id]
    });
    return result.rows[0];
  }

  // Clientes por Reparto methods
  async getClientesPorReparto() {
    const result = await this.client.execute(`
      SELECT 
        cr.*,
        c.name as client_name,
        c.address as client_address,
        c.latitude,
        c.longitude,
        r.name as reparto_name
      FROM clientes_reparto cr
      LEFT JOIN clients c ON cr.client_id = c.id
      LEFT JOIN repartos r ON cr.reparto_id = r.id
      ORDER BY cr.order_number ASC
    `);
    return result.rows;
  }

  // Métodos de limpieza de datos
  async clearAllUsers() {
    const result = await this.client.execute('DELETE FROM users');
    return { deletedCount: result.rowsAffected };
  }

  async clearAllClients() {
    const result = await this.client.execute('DELETE FROM clients');
    return { deletedCount: result.rowsAffected };
  }

  async clearAllTrucks() {
    const result = await this.client.execute('DELETE FROM trucks');
    return { deletedCount: result.rowsAffected };
  }

  async clearAllRepartos() {
    const result = await this.client.execute('DELETE FROM repartos');
    return { deletedCount: result.rowsAffected };
  }

  async clearAllDiasEntrega() {
    const result = await this.client.execute('DELETE FROM dias_entrega');
    return { deletedCount: result.rowsAffected };
  }

  async clearAllClientesporReparto() {
    const result = await this.client.execute('DELETE FROM clientes_reparto');
    return { deletedCount: result.rowsAffected };
  }

  // ===== MÉTODOS ESPECÍFICOS DE AUTENTICACIÓN =====
  
  async getUserByUsernameOrEmail(usernameOrEmail) {
    const result = await this.client.execute({
      sql: 'SELECT * FROM users WHERE usuario = ? LIMIT 1',
      args: [usernameOrEmail]
    });
    return result.rows[0] || null;
  }

  async getUserByEmail(email) {
    // Ya no usamos email, redirigir a búsqueda por usuario
    return this.getUserByUsernameOrEmail(email);
  }

  async updateUserLastLogin(userId) {
    await this.client.execute({
      sql: 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      args: [userId]
    });
    return true;
  }

  async updateUserResetToken(userId, resetToken, resetTokenExpires) {
    await this.client.execute({
      sql: 'UPDATE users SET reset_token = ?, reset_token_expires = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [resetToken, resetTokenExpires.toISOString(), userId]
    });
    return true;
  }

  async getUserByResetToken(resetToken) {
    const result = await this.client.execute({
      sql: 'SELECT * FROM users WHERE reset_token = ? LIMIT 1',
      args: [resetToken]
    });
    return result.rows[0] || null;
  }

  async updateUserPassword(userId, hashedPassword) {
    await this.client.execute({
      sql: 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [hashedPassword, userId]
    });
    return true;
  }

  async clearUserResetToken(userId) {
    await this.client.execute({
      sql: 'UPDATE users SET reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [userId]
    });
    return true;
  }

  // ===== MÉTODOS DE INICIALIZACIÓN DE DATOS =====
  
  async getUsersCount() {
    const result = await this.client.execute('SELECT COUNT(*) as count FROM users');
    return result.rows[0]?.count || 0;
  }

  async seedInitialData() {
    const userCount = await this.getUsersCount();
    if (userCount === 0) {
      const initialUsers = [
        { usuario: 'admin', password: 'admin123' },
        { usuario: 'usuario1', password: 'pass123' },
        { usuario: 'operador', password: 'operador456' }
      ];

      for (const user of initialUsers) {
        try {
          await this.createUser(user);
        } catch (error) {
          console.error('Error creando usuario inicial en Turso:', error);
        }
      }
      console.log(`🌱 Se crearon ${initialUsers.length} usuarios iniciales en Turso`);
    }
  }
}

export default TursoDatabase;
