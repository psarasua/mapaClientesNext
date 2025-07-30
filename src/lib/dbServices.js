import { db } from './database.js';

// Funciones para usuarios
export const userService = {
  async getAll() {
    const result = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    });
    return result.rows[0] || null;
  },

  async getByUsuario(usuario) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE usuario = ?',
      args: [usuario]
    });
    return result.rows[0] || null;
  },

  async create(userData) {
    const { usuario, password } = userData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `INSERT INTO users (usuario, password, created_at, updated_at) 
            VALUES (?, ?, ?, ?) RETURNING *`,
      args: [usuario, password, now, now]
    });
    
    return result.rows[0];
  },

  async update(id, userData) {
    const { usuario } = userData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `UPDATE users SET usuario = ?, updated_at = ? 
            WHERE id = ? RETURNING *`,
      args: [usuario, now, id]
    });
    
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.execute({
      sql: 'DELETE FROM users WHERE id = ? RETURNING *',
      args: [id]
    });
    
    return result.rows[0];
  },

  async count() {
    const result = await db.execute('SELECT COUNT(*) as count FROM users');
    return result.rows[0].count;
  },

  async deleteAll() {
    const result = await db.execute('DELETE FROM users');
    return result.rowsAffected;
  }
};

// Funciones para camiones
export const truckService = {
  async getAll() {
    const result = await db.execute('SELECT * FROM trucks ORDER BY license_plate');
    return result.rows;
  },

  async create(truckData) {
    const { description, brand, model, year, license_plate, capacity, status = 'active' } = truckData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `INSERT INTO trucks (description, brand, model, year, license_plate, capacity, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      args: [description, brand, model, year, license_plate, capacity, status, now, now]
    });
    
    return result.rows[0];
  },

  async update(id, truckData) {
    const { description, brand, model, year, license_plate, capacity, status } = truckData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `UPDATE trucks SET description = ?, brand = ?, model = ?, year = ?, 
            license_plate = ?, capacity = ?, status = ?, updated_at = ? 
            WHERE id = ? RETURNING *`,
      args: [description, brand, model, year, license_plate, capacity, status, now, id]
    });
    
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.execute({
      sql: 'DELETE FROM trucks WHERE id = ? RETURNING *',
      args: [id]
    });
    
    return result.rows[0];
  },

  async deleteAll() {
    const result = await db.execute('DELETE FROM trucks');
    return result.rowsAffected;
  }
};

// Funciones para clientes
export const clientService = {
  async getAll() {
    const result = await db.execute('SELECT * FROM clients ORDER BY nombre');
    return result.rows;
  },

  async getById(id) {
    const result = await db.execute({
      sql: 'SELECT * FROM clients WHERE id = ?',
      args: [id]
    });
    return result.rows[0] || null;
  },

  async create(clientData) {
    const { codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo = 1, latitud, longitud } = clientData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `INSERT INTO clients (codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo, latitud, longitud, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      args: [codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo, latitud, longitud, now, now]
    });
    
    return result.rows[0];
  },

  async update(id, clientData) {
    const { codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo, latitud, longitud } = clientData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `UPDATE clients SET codigoalternativo = ?, razonsocial = ?, nombre = ?, direccion = ?, 
            telefono = ?, rut = ?, activo = ?, latitud = ?, longitud = ?, updated_at = ? 
            WHERE id = ? RETURNING *`,
      args: [codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo, latitud, longitud, now, id]
    });
    
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.execute({
      sql: 'DELETE FROM clients WHERE id = ? RETURNING *',
      args: [id]
    });
    
    return result.rows[0];
  },

  async deleteAll() {
    const result = await db.execute('DELETE FROM clients');
    return result.rowsAffected;
  }
};

// Funciones para repartos
export const repartoService = {
  async getAll() {
    const result = await db.execute('SELECT * FROM repartos ORDER BY created_at DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await db.execute({
      sql: 'SELECT * FROM repartos WHERE id = ?',
      args: [id]
    });
    return result.rows[0] || null;
  },

  async create(repartoData) {
    const { nombre, descripcion } = repartoData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `INSERT INTO repartos (nombre, descripcion, created_at, updated_at) 
            VALUES (?, ?, ?, ?) RETURNING *`,
      args: [nombre, descripcion, now, now]
    });
    
    return result.rows[0];
  },

  async update(id, repartoData) {
    const { nombre, descripcion } = repartoData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `UPDATE repartos SET nombre = ?, descripcion = ?, updated_at = ? 
            WHERE id = ? RETURNING *`,
      args: [nombre, descripcion, now, id]
    });
    
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.execute({
      sql: 'DELETE FROM repartos WHERE id = ? RETURNING *',
      args: [id]
    });
    
    return result.rows[0];
  },

  async deleteAll() {
    const result = await db.execute('DELETE FROM repartos');
    return result.rowsAffected;
  }
};

// Funciones para días de entrega
export const diaEntregaService = {
  async getAll() {
    const result = await db.execute('SELECT * FROM diasEntrega ORDER BY nombre');
    return result.rows;
  },

  async create(diaData) {
    const { nombre, descripcion } = diaData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `INSERT INTO diasEntrega (nombre, descripcion, created_at, updated_at) 
            VALUES (?, ?, ?, ?) RETURNING *`,
      args: [nombre, descripcion, now, now]
    });
    
    return result.rows[0];
  },

  async update(id, diaData) {
    const { nombre, descripcion } = diaData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `UPDATE diasEntrega SET nombre = ?, descripcion = ?, updated_at = ? 
            WHERE id = ? RETURNING *`,
      args: [nombre, descripcion, now, id]
    });
    
    return result.rows[0];
  },

  async update(id, diaData) {
    const { nombre, descripcion } = diaData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `UPDATE diasEntrega SET nombre = ?, descripcion = ?, updated_at = ? 
            WHERE id = ? RETURNING *`,
      args: [nombre, descripcion, now, id]
    });
    
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.execute({
      sql: 'DELETE FROM diasEntrega WHERE id = ? RETURNING *',
      args: [id]
    });
    
    return result.rows[0];
  },

  async deleteAll() {
    const result = await db.execute('DELETE FROM diasEntrega');
    return result.rowsAffected;
  }
};

// Funciones para clientesporReparto
export const clienteporRepartoService = {
  async getAll() {
    const result = await db.execute('SELECT * FROM clientesporReparto ORDER BY created_at DESC');
    return result.rows;
  },

  async create(clienteporRepartoData) {
    const { clientId, repartoId } = clienteporRepartoData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `INSERT INTO clientesporReparto (clientId, repartoId, created_at, updated_at) 
            VALUES (?, ?, ?, ?) RETURNING *`,
      args: [clientId, repartoId, now, now]
    });
    
    return result.rows[0];
  },

  async update(id, clienteporRepartoData) {
    const { clientId, repartoId } = clienteporRepartoData;
    const now = new Date().toISOString();
    
    const result = await db.execute({
      sql: `UPDATE clientesporReparto SET clientId = ?, repartoId = ?, updated_at = ? 
            WHERE id = ? RETURNING *`,
      args: [clientId, repartoId, now, id]
    });
    
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.execute({
      sql: 'DELETE FROM clientesporReparto WHERE id = ? RETURNING *',
      args: [id]
    });
    
    return result.rows[0];
  },

  async deleteAll() {
    const result = await db.execute('DELETE FROM clientesporReparto');
    return result.rowsAffected;
  }
};
