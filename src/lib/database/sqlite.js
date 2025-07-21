import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

class SQLiteDatabase {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.cwd(), 'data', 'users.db');
  }

  async init() {
    if (this.db) return this.db;

    try {
      // Crear directorio si no existe
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new Database(this.dbPath);
      
      // Crear tabla de usuarios si no existe
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          age INTEGER NOT NULL,
          phone TEXT,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de camiones si no existe
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS trucks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de clientes si no existe
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          codigoalternativo TEXT,
          razonsocial TEXT,
          nombre TEXT NOT NULL,
          direccion TEXT,
          telefono TEXT,
          rut TEXT,
          activo INTEGER DEFAULT 1,
          latitud REAL,
          longitud REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de días de entrega si no existe
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS diasEntrega (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          descripcion TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de repartos si no existe
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS repartos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          diasEntrega_id INTEGER NOT NULL,
          camion_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (diasEntrega_id) REFERENCES diasEntrega(id),
          FOREIGN KEY (camion_id) REFERENCES trucks(id),
          UNIQUE(diasEntrega_id, camion_id)
        )
      `);

      // Crear tabla de clientes por reparto si no existe
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS ClientesporReparto (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reparto_id INTEGER NOT NULL,
          cliente_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (reparto_id) REFERENCES repartos(id) ON DELETE CASCADE,
          FOREIGN KEY (cliente_id) REFERENCES clients(id),
          UNIQUE(reparto_id, cliente_id)
        )
      `);

      // Crear índices para mejor rendimiento
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
        CREATE INDEX IF NOT EXISTS idx_trucks_description ON trucks(description);
        CREATE INDEX IF NOT EXISTS idx_clients_rut ON clients(rut);
        CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(nombre);
        CREATE INDEX IF NOT EXISTS idx_clients_codigo ON clients(codigoalternativo);
        CREATE INDEX IF NOT EXISTS idx_diasEntrega_descripcion ON diasEntrega(descripcion);
        CREATE INDEX IF NOT EXISTS idx_repartos_dia ON repartos(diasEntrega_id);
        CREATE INDEX IF NOT EXISTS idx_repartos_camion ON repartos(camion_id);
        CREATE INDEX IF NOT EXISTS idx_ClientesporReparto_reparto ON ClientesporReparto(reparto_id);
        CREATE INDEX IF NOT EXISTS idx_ClientesporReparto_cliente ON ClientesporReparto(cliente_id);
      `);

      console.log('✅ Base de datos SQLite inicializada correctamente');
      
      // Inicializar datos si es necesario
      await this.seedInitialData();
      
      return this.db;
    } catch (error) {
      console.error('❌ Error inicializando SQLite:', error);
      throw error;
    }
  }

  // ===== MÉTODOS PARA USUARIOS =====
  
  async getAllUsers() {
    const db = await this.init();
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all();
  }

  async getUserById(id) {
    const db = await this.init();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const result = stmt.get(id);
    return result || null;
  }

  async createUser(userData) {
    const db = await this.init();
    const stmt = db.prepare(`
      INSERT INTO users (name, email, age, phone, role) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userData.name, 
      userData.email, 
      userData.age,
      userData.phone || null,
      userData.role || 'user'
    );
    
    return this.getUserById(result.lastInsertRowid);
  }

  async updateUser(id, userData) {
    const db = await this.init();
    
    const fields = Object.keys(userData).filter(key => userData[key] !== undefined);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => userData[field]);
    
    const stmt = db.prepare(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    stmt.run(...values, id);
    return this.getUserById(id);
  }

  async deleteUser(id) {
    const db = await this.init();
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async searchUsers(query) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT * FROM users 
      WHERE name LIKE ? OR email LIKE ? 
      ORDER BY created_at DESC
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern, searchPattern);
  }

  async getUsersCount() {
    const db = await this.init();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get();
    return result.count;
  }

  // ===== MÉTODOS PARA CAMIONES =====
  
  async getAllTrucks() {
    const db = await this.init();
    const stmt = db.prepare('SELECT * FROM trucks ORDER BY created_at DESC');
    return stmt.all();
  }

  async getTruckById(id) {
    const db = await this.init();
    const stmt = db.prepare('SELECT * FROM trucks WHERE id = ?');
    const result = stmt.get(id);
    return result || null;
  }

  async createTruck(truckData) {
    const db = await this.init();
    const stmt = db.prepare(`
      INSERT INTO trucks (description) 
      VALUES (?)
    `);
    
    const result = stmt.run(truckData.description);
    
    return this.getTruckById(result.lastInsertRowid);
  }

  async updateTruck(id, truckData) {
    const db = await this.init();
    
    const fields = Object.keys(truckData).filter(key => truckData[key] !== undefined);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => truckData[field]);
    
    const stmt = db.prepare(`
      UPDATE trucks 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    stmt.run(...values, id);
    return this.getTruckById(id);
  }

  async deleteTruck(id) {
    const db = await this.init();
    const stmt = db.prepare('DELETE FROM trucks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async searchTrucks(query) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT * FROM trucks 
      WHERE description LIKE ? 
      ORDER BY created_at DESC
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern);
  }

  async getTrucksCount() {
    const db = await this.init();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM trucks');
    const result = stmt.get();
    return result.count;
  }

  // ===== MÉTODOS PARA CLIENTES =====
  
  async getAllClients() {
    const db = await this.init();
    const stmt = db.prepare('SELECT * FROM clients ORDER BY created_at DESC');
    return stmt.all();
  }

  async getClientById(id) {
    const db = await this.init();
    const stmt = db.prepare('SELECT * FROM clients WHERE id = ?');
    const result = stmt.get(id);
    return result || null;
  }

  async createClient(clientData) {
    const db = await this.init();
    const stmt = db.prepare(`
      INSERT INTO clients (codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo, latitud, longitud) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      clientData.codigoalternativo || null,
      clientData.razonsocial || null,
      clientData.nombre,
      clientData.direccion || null,
      clientData.telefono || null,
      clientData.rut || null,
      clientData.activo !== undefined ? clientData.activo : 1,
      clientData.latitud || null,
      clientData.longitud || null
    );
    
    return this.getClientById(result.lastInsertRowid);
  }

  async updateClient(id, clientData) {
    const db = await this.init();
    
    const fields = Object.keys(clientData).filter(key => clientData[key] !== undefined);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => clientData[field]);
    
    const stmt = db.prepare(`
      UPDATE clients 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    stmt.run(...values, id);
    return this.getClientById(id);
  }

  async deleteClient(id) {
    const db = await this.init();
    const stmt = db.prepare('DELETE FROM clients WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async searchClients(query) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT * FROM clients 
      WHERE nombre LIKE ? OR razonsocial LIKE ? OR rut LIKE ? OR codigoalternativo LIKE ?
      ORDER BY created_at DESC
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  async getClientsCount() {
    const db = await this.init();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM clients');
    const result = stmt.get();
    return result.count;
  }

  async seedInitialData() {
    const userCount = await this.getUsersCount();
    if (userCount === 0) {
      const initialUsers = [
        { name: 'María García', email: 'maria.garcia@example.com', age: 28, phone: '+34 666 111 222', role: 'admin' },
        { name: 'Juan Pérez', email: 'juan.perez@example.com', age: 32, phone: '+34 666 333 444', role: 'user' },
        { name: 'Ana Martínez', email: 'ana.martinez@example.com', age: 25, phone: '+34 666 555 666', role: 'user' }
      ];

      for (const user of initialUsers) {
        try {
          await this.createUser(user);
        } catch (error) {
          console.error('Error creando usuario inicial:', error);
        }
      }
      console.log(`🌱 Se crearon ${initialUsers.length} usuarios iniciales`);
    }

    await this.seedInitialTrucks();
    await this.seedInitialClients();
    await this.seedInitialDiasEntrega();
    await this.seedInitialRepartos();
    await this.seedInitialClientesporReparto();
  }

  async seedInitialTrucks() {
    const count = await this.getTrucksCount();
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

    console.log(`🚚 Se crearon ${initialTrucks.length} camiones iniciales`);
  }

  async seedInitialClients() {
    const count = await this.getClientsCount();
    if (count > 0) {
      return;
    }

    const initialClients = [
      {
        codigoalternativo: 'CLI001',
        razonsocial: 'Supermercados Central S.A.',
        nombre: 'Supermercados Central',
        direccion: 'Av. Libertador 1234, Santiago',
        telefono: '+56 2 2555 0001',
        rut: '96.789.123-4',
        activo: 1,
        latitud: -33.4489,
        longitud: -70.6693
      },
      {
        codigoalternativo: 'CLI002',
        razonsocial: 'Distribuidora Norte Ltda.',
        nombre: 'Distribuidora Norte',
        direccion: 'Calle Principal 567, Antofagasta',
        telefono: '+56 55 2444 0002',
        rut: '76.543.210-9',
        activo: 1,
        latitud: -23.6509,
        longitud: -70.3975
      },
      {
        codigoalternativo: 'CLI003',
        razonsocial: 'Comercial Sur SpA',
        nombre: 'Comercial Sur',
        direccion: 'Av. Alemania 890, Temuco',
        telefono: '+56 45 2333 0003',
        rut: '99.876.543-2',
        activo: 1,
        latitud: -38.7359,
        longitud: -72.5904
      },
      {
        codigoalternativo: 'CLI004',
        razonsocial: 'Almacenes Costa S.A.',
        nombre: 'Almacenes Costa',
        direccion: 'Borde Costero 246, Valparaíso',
        telefono: '+56 32 2222 0004',
        rut: '88.765.432-1',
        activo: 1,
        latitud: -33.0458,
        longitud: -71.6197
      },
      {
        codigoalternativo: 'CLI005',
        razonsocial: 'Mayorista Express Ltda.',
        nombre: 'Mayorista Express',
        direccion: 'Zona Industrial 135, La Serena',
        telefono: '+56 51 2111 0005',
        rut: '77.654.321-0',
        activo: 1,
        latitud: -29.9027,
        longitud: -71.2519
      },
      {
        codigoalternativo: 'CLI006',
        razonsocial: 'Retail Premium S.A.',
        nombre: 'Retail Premium',
        direccion: 'Mall Plaza 789, Concepción',
        telefono: '+56 41 2000 0006',
        rut: '66.543.210-8',
        activo: 1,
        latitud: -36.8270,
        longitud: -73.0498
      },
      {
        codigoalternativo: 'CLI007',
        razonsocial: 'Logística Integral SpA',
        nombre: 'Logística Integral',
        direccion: 'Parque Industrial 456, Rancagua',
        telefono: '+56 72 1999 0007',
        rut: '55.432.109-7',
        activo: 1,
        latitud: -34.1708,
        longitud: -70.7394
      },
      {
        codigoalternativo: 'CLI008',
        razonsocial: 'Distribuciones Andinas Ltda.',
        nombre: 'Distribuciones Andinas',
        direccion: 'Sector Cordillera 321, Los Andes',
        telefono: '+56 34 1888 0008',
        rut: '44.321.098-6',
        activo: 0,
        latitud: -32.8340,
        longitud: -70.5977
      },
      {
        codigoalternativo: 'CLI009',
        razonsocial: 'Comercio Patagónico S.A.',
        nombre: 'Comercio Patagónico',
        direccion: 'Ruta Austral 654, Puerto Montt',
        telefono: '+56 65 1777 0009',
        rut: '33.210.987-5',
        activo: 1,
        latitud: -41.4693,
        longitud: -72.9424
      },
      {
        codigoalternativo: 'CLI010',
        razonsocial: 'Abastecedora Metropolitana SpA',
        nombre: 'Abastecedora Metropolitana',
        direccion: 'Gran Avenida 987, San Miguel',
        telefono: '+56 2 1666 0010',
        rut: '22.109.876-4',
        activo: 1,
        latitud: -33.4969,
        longitud: -70.6483
      }
    ];

    for (const client of initialClients) {
      try {
        await this.createClient(client);
      } catch (error) {
        console.error('Error creando cliente inicial:', error);
      }
    }

    console.log(`👥 Se crearon ${initialClients.length} clientes iniciales`);
  }

  async seedInitialDiasEntrega() {
    const count = await this.getDiasEntregaCount();
    if (count > 0) return;

    const diasSemana = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes'
    ];

    for (const dia of diasSemana) {
      try {
        await this.createDiaEntrega({ descripcion: dia });
      } catch (error) {
        console.error('Error creando día inicial:', error);
      }
    }

    console.log(`📅 Se crearon ${diasSemana.length} días de entrega iniciales`);
  }

  // ===== MÉTODOS PARA DÍAS DE ENTREGA =====
  
  async getAllDiasEntrega() {
    const db = await this.init();
    const stmt = db.prepare('SELECT * FROM diasEntrega ORDER BY id ASC');
    return stmt.all();
  }

  async getDiaEntregaById(id) {
    const db = await this.init();
    const stmt = db.prepare('SELECT * FROM diasEntrega WHERE id = ?');
    const result = stmt.get(id);
    return result || null;
  }

  async createDiaEntrega(diaData) {
    const db = await this.init();
    const { descripcion } = diaData;
    
    const stmt = db.prepare(`
      INSERT INTO diasEntrega (descripcion)
      VALUES (?)
    `);
    
    const result = stmt.run(descripcion);
    
    // Retornar el día creado
    return await this.getDiaEntregaById(result.lastInsertRowid);
  }

  async updateDiaEntrega(id, diaData) {
    const db = await this.init();
    const { descripcion } = diaData;
    
    const stmt = db.prepare(`
      UPDATE diasEntrega 
      SET descripcion = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(descripcion, id);
    
    if (result.changes === 0) {
      return null;
    }
    
    return await this.getDiaEntregaById(id);
  }

  async deleteDiaEntrega(id) {
    const db = await this.init();
    const stmt = db.prepare('DELETE FROM diasEntrega WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async getDiasEntregaCount() {
    const db = await this.init();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM diasEntrega');
    const result = stmt.get();
    return result.count || 0;
  }

  async searchDiasEntrega(searchTerm) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT * FROM diasEntrega 
      WHERE descripcion LIKE ?
      ORDER BY descripcion ASC
    `);
    return stmt.all(`%${searchTerm}%`);
  }

  async seedInitialRepartos() {
    const count = await this.getRepartosCount();
    if (count > 0) return;

    // Obtener todos los camiones y días de entrega
    const camiones = await this.getAllTrucks();
    const diasEntrega = await this.getAllDiasEntrega();

    if (camiones.length === 0 || diasEntrega.length === 0) {
      console.log('⚠️ No se pueden crear repartos: faltan camiones o días de entrega');
      return;
    }

    let repartosCreados = 0;

    // Crear repartos para cada combinación de camión y día
    for (const dia of diasEntrega) {
      for (const camion of camiones) {
        try {
          await this.createReparto({
            diasEntrega_id: dia.id,
            camion_id: camion.id
          });
          repartosCreados++;
        } catch (error) {
          console.error(`Error creando reparto para camión ${camion.id} y día ${dia.id}:`, error);
        }
      }
    }

    console.log(`🚚 Se crearon ${repartosCreados} repartos iniciales (${camiones.length} camiones × ${diasEntrega.length} días)`);
  }

  // ===== MÉTODOS PARA REPARTOS =====
  
  async getAllRepartos() {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT 
        r.*,
        d.descripcion as dia_descripcion,
        t.description as camion_descripcion
      FROM repartos r
      LEFT JOIN diasEntrega d ON r.diasEntrega_id = d.id
      LEFT JOIN trucks t ON r.camion_id = t.id
      ORDER BY d.id, t.id
    `);
    return stmt.all();
  }

  async getRepartoById(id) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT 
        r.*,
        d.descripcion as dia_descripcion,
        t.description as camion_descripcion
      FROM repartos r
      LEFT JOIN diasEntrega d ON r.diasEntrega_id = d.id
      LEFT JOIN trucks t ON r.camion_id = t.id
      WHERE r.id = ?
    `);
    const result = stmt.get(id);
    return result || null;
  }

  async getRepartosByDia(diasEntregaId) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT 
        r.*,
        d.descripcion as dia_descripcion,
        t.description as camion_descripcion
      FROM repartos r
      LEFT JOIN diasEntrega d ON r.diasEntrega_id = d.id
      LEFT JOIN trucks t ON r.camion_id = t.id
      WHERE r.diasEntrega_id = ?
      ORDER BY t.id
    `);
    return stmt.all(diasEntregaId);
  }

  async getRepartosByCamion(camionId) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT 
        r.*,
        d.descripcion as dia_descripcion,
        t.description as camion_descripcion
      FROM repartos r
      LEFT JOIN diasEntrega d ON r.diasEntrega_id = d.id
      LEFT JOIN trucks t ON r.camion_id = t.id
      WHERE r.camion_id = ?
      ORDER BY d.id
    `);
    return stmt.all(camionId);
  }

  async createReparto(repartoData) {
    const db = await this.init();
    const { diasEntrega_id, camion_id } = repartoData;
    
    const stmt = db.prepare(`
      INSERT INTO repartos (diasEntrega_id, camion_id)
      VALUES (?, ?)
    `);
    
    const result = stmt.run(diasEntrega_id, camion_id);
    
    // Retornar el reparto creado
    return await this.getRepartoById(result.lastInsertRowid);
  }

  async updateReparto(id, repartoData) {
    const db = await this.init();
    const { diasEntrega_id, camion_id } = repartoData;
    
    const stmt = db.prepare(`
      UPDATE repartos 
      SET diasEntrega_id = ?, camion_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(diasEntrega_id, camion_id, id);
    
    if (result.changes === 0) {
      return null;
    }
    
    return await this.getRepartoById(id);
  }

  async deleteReparto(id) {
    const db = await this.init();
    const stmt = db.prepare('DELETE FROM repartos WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async getRepartosCount() {
    const db = await this.init();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM repartos');
    const result = stmt.get();
    return result.count || 0;
  }

  async searchRepartos(searchTerm) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT 
        r.*,
        d.descripcion as dia_descripcion,
        t.description as camion_descripcion
      FROM repartos r
      LEFT JOIN diasEntrega d ON r.diasEntrega_id = d.id
      LEFT JOIN trucks t ON r.camion_id = t.id
      WHERE d.descripcion LIKE ? OR t.description LIKE ?
      ORDER BY d.id, t.id
    `);
    return stmt.all(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  async seedInitialClientesporReparto() {
    const count = await this.getClientesporRepartoCount();
    if (count > 0) return;

    // Obtener todos los repartos y clientes
    const repartos = await this.getAllRepartos();
    const clientes = await this.getAllClients();

    if (repartos.length === 0 || clientes.length === 0) {
      console.log('⚠️ No se pueden crear asignaciones: faltan repartos o clientes');
      return;
    }

    let asignacionesCreadas = 0;

    // Asignar clientes aleatoriamente a repartos (2-4 clientes por reparto)
    for (const reparto of repartos) {
      // Número aleatorio de clientes por reparto entre 2 y 4
      const numClientes = Math.floor(Math.random() * 3) + 2;
      
      // Mezclar clientes y tomar los primeros
      const clientesShuffled = [...clientes].sort(() => 0.5 - Math.random());
      const clientesAsignados = clientesShuffled.slice(0, numClientes);

      for (const cliente of clientesAsignados) {
        try {
          await this.createClienteporReparto({
            reparto_id: reparto.id,
            cliente_id: cliente.id
          });
          asignacionesCreadas++;
        } catch (error) {
          console.error(`Error creando asignación para reparto ${reparto.id} y cliente ${cliente.id}:`, error);
        }
      }
    }

    console.log(`👥 Se crearon ${asignacionesCreadas} asignaciones de clientes a repartos`);
  }

  // ===== MÉTODOS PARA CLIENTES POR REPARTO =====
  
  async getAllClientesporReparto() {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT 
        cpr.*,
        r.diasEntrega_id,
        r.camion_id,
        d.descripcion as dia_descripcion,
        t.description as camion_descripcion,
        c.nombre as cliente_nombre,
        c.razonsocial as cliente_razonsocial,
        c.direccion as cliente_direccion,
        c.telefono as cliente_telefono,
        c.rut as cliente_rut
      FROM ClientesporReparto cpr
      LEFT JOIN repartos r ON cpr.reparto_id = r.id
      LEFT JOIN diasEntrega d ON r.diasEntrega_id = d.id
      LEFT JOIN trucks t ON r.camion_id = t.id
      LEFT JOIN clients c ON cpr.cliente_id = c.id
      ORDER BY d.id, t.id, c.nombre
    `);
    return stmt.all();
  }

  async getClienteporRepartoById(id) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT 
        cpr.*,
        r.diasEntrega_id,
        r.camion_id,
        d.descripcion as dia_descripcion,
        t.description as camion_descripcion,
        c.nombre as cliente_nombre,
        c.razonsocial as cliente_razonsocial,
        c.direccion as cliente_direccion,
        c.telefono as cliente_telefono,
        c.rut as cliente_rut
      FROM ClientesporReparto cpr
      LEFT JOIN repartos r ON cpr.reparto_id = r.id
      LEFT JOIN diasEntrega d ON r.diasEntrega_id = d.id
      LEFT JOIN trucks t ON r.camion_id = t.id
      LEFT JOIN clients c ON cpr.cliente_id = c.id
      WHERE cpr.id = ?
    `);
    const result = stmt.get(id);
    return result || null;
  }

  async getClientesporRepartoByReparto(repartoId) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT 
        cpr.*,
        c.nombre as cliente_nombre,
        c.razonsocial as cliente_razonsocial,
        c.direccion as cliente_direccion,
        c.telefono as cliente_telefono,
        c.rut as cliente_rut,
        c.latitud,
        c.longitud
      FROM ClientesporReparto cpr
      LEFT JOIN clients c ON cpr.cliente_id = c.id
      WHERE cpr.reparto_id = ?
      ORDER BY c.nombre
    `);
    return stmt.all(repartoId);
  }

  async getClientesporRepartoByCliente(clienteId) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT 
        cpr.*,
        r.diasEntrega_id,
        r.camion_id,
        d.descripcion as dia_descripcion,
        t.description as camion_descripcion
      FROM ClientesporReparto cpr
      LEFT JOIN repartos r ON cpr.reparto_id = r.id
      LEFT JOIN diasEntrega d ON r.diasEntrega_id = d.id
      LEFT JOIN trucks t ON r.camion_id = t.id
      WHERE cpr.cliente_id = ?
      ORDER BY d.id, t.id
    `);
    return stmt.all(clienteId);
  }

  async createClienteporReparto(clienteRepartoData) {
    const db = await this.init();
    const { reparto_id, cliente_id } = clienteRepartoData;
    
    const stmt = db.prepare(`
      INSERT INTO ClientesporReparto (reparto_id, cliente_id)
      VALUES (?, ?)
    `);
    
    const result = stmt.run(reparto_id, cliente_id);
    
    // Retornar la asignación creada
    return await this.getClienteporRepartoById(result.lastInsertRowid);
  }

  async updateClienteporReparto(id, clienteRepartoData) {
    const db = await this.init();
    const { reparto_id, cliente_id } = clienteRepartoData;
    
    const stmt = db.prepare(`
      UPDATE ClientesporReparto 
      SET reparto_id = ?, cliente_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(reparto_id, cliente_id, id);
    
    if (result.changes === 0) {
      return null;
    }
    
    return await this.getClienteporRepartoById(id);
  }

  async deleteClienteporReparto(id) {
    const db = await this.init();
    const stmt = db.prepare('DELETE FROM ClientesporReparto WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async getClientesporRepartoCount() {
    const db = await this.init();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM ClientesporReparto');
    const result = stmt.get();
    return result.count || 0;
  }

  async searchClientesporReparto(searchTerm) {
    const db = await this.init();
    const stmt = db.prepare(`
      SELECT 
        cpr.*,
        r.diasEntrega_id,
        r.camion_id,
        d.descripcion as dia_descripcion,
        t.description as camion_descripcion,
        c.nombre as cliente_nombre,
        c.razonsocial as cliente_razonsocial,
        c.direccion as cliente_direccion,
        c.telefono as cliente_telefono,
        c.rut as cliente_rut
      FROM ClientesporReparto cpr
      LEFT JOIN repartos r ON cpr.reparto_id = r.id
      LEFT JOIN diasEntrega d ON r.diasEntrega_id = d.id
      LEFT JOIN trucks t ON r.camion_id = t.id
      LEFT JOIN clients c ON cpr.cliente_id = c.id
      WHERE d.descripcion LIKE ? OR t.description LIKE ? OR c.nombre LIKE ? OR c.rut LIKE ?
      ORDER BY d.id, t.id, c.nombre
    `);
    return stmt.all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

let sqliteInstance = null;

export const getSQLiteDB = () => {
  sqliteInstance = new SQLiteDatabase();
  return sqliteInstance;
};

export { SQLiteDatabase };