import { db } from '../database.js';
import { logger } from '../logger.js';

export const truckService = {
  async getAll() {
    try {
      const result = await db.execute('SELECT * FROM trucks ORDER BY license_plate');
      logger.debug('Camiones obtenidos:', result.rows.length);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo camiones:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM trucks WHERE id = ?',
        args: [id]
      });
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error obteniendo camión por ID:', error);
      throw error;
    }
  },

  async create(truckData) {
    try {
      const { description, brand, model, year, license_plate, capacity, status = 'active' } = truckData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `INSERT INTO trucks (description, brand, model, year, license_plate, capacity, status, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        args: [description, brand, model, year, license_plate, capacity, status, now, now]
      });
      
      logger.success('Camión creado:', result.rows[0].id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creando camión:', error);
      throw error;
    }
  },

  async update(id, truckData) {
    try {
      const { description, brand, model, year, license_plate, capacity, status } = truckData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `UPDATE trucks SET description = ?, brand = ?, model = ?, year = ?, 
              license_plate = ?, capacity = ?, status = ?, updated_at = ? 
              WHERE id = ? RETURNING *`,
        args: [description, brand, model, year, license_plate, capacity, status, now, id]
      });
      
      logger.success('Camión actualizado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error actualizando camión:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const result = await db.execute({
        sql: 'DELETE FROM trucks WHERE id = ? RETURNING *',
        args: [id]
      });
      
      logger.success('Camión eliminado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error eliminando camión:', error);
      throw error;
    }
  },

  async count() {
    try {
      const result = await db.execute('SELECT COUNT(*) as count FROM trucks');
      return result.rows[0].count;
    } catch (error) {
      logger.error('Error contando camiones:', error);
      throw error;
    }
  },

  async deleteAll() {
    try {
      const result = await db.execute('DELETE FROM trucks');
      logger.warning('Todos los camiones eliminados');
      return result.rowsAffected;
    } catch (error) {
      logger.error('Error eliminando todos los camiones:', error);
      throw error;
    }
  }
}; 