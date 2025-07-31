import { db } from '../database.js';
import { logger } from '../logger.js';

export const clientService = {
  async getAll() {
    try {
      const result = await db.execute('SELECT * FROM clients ORDER BY nombre');
      logger.debug('Clientes obtenidos:', result.rows.length);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo clientes:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      if (!id || id === null || id === undefined) {
        logger.warning('ID de cliente no proporcionado o inválido:', id);
        return null;
      }
      
      // Convertir a número si es string
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(numericId)) {
        logger.warning('ID de cliente no es un número válido:', id);
        return null;
      }
      
      const result = await db.execute({
        sql: 'SELECT * FROM clients WHERE id = ?',
        args: [numericId]
      });
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error obteniendo cliente por ID:', error);
      throw error;
    }
  },

  async create(clientData) {
    try {
      const { codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo = 1, latitud, longitud } = clientData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `INSERT INTO clients (codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo, latitud, longitud, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        args: [codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo, latitud, longitud, now, now]
      });
      
      logger.success('Cliente creado:', result.rows[0].id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creando cliente:', error);
      throw error;
    }
  },

  async update(id, clientData) {
    try {
      const { codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo, latitud, longitud } = clientData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `UPDATE clients SET codigoalternativo = ?, razonsocial = ?, nombre = ?, direccion = ?, 
              telefono = ?, rut = ?, activo = ?, latitud = ?, longitud = ?, updated_at = ? 
              WHERE id = ? RETURNING *`,
        args: [codigoalternativo, razonsocial, nombre, direccion, telefono, rut, activo, latitud, longitud, now, id]
      });
      
      logger.success('Cliente actualizado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error actualizando cliente:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const result = await db.execute({
        sql: 'DELETE FROM clients WHERE id = ? RETURNING *',
        args: [id]
      });
      
      logger.success('Cliente eliminado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error eliminando cliente:', error);
      throw error;
    }
  },

  async count() {
    try {
      const result = await db.execute('SELECT COUNT(*) as count FROM clients');
      return result.rows[0].count;
    } catch (error) {
      logger.error('Error contando clientes:', error);
      throw error;
    }
  },

  async deleteAll() {
    try {
      const result = await db.execute('DELETE FROM clients');
      logger.warning('Todos los clientes eliminados');
      return result.rowsAffected;
    } catch (error) {
      logger.error('Error eliminando todos los clientes:', error);
      throw error;
    }
  }
}; 