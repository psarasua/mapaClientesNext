import { db } from '../database.js';
import { logger } from '../logger.js';

export const diaEntregaService = {
  async getAll() {
    try {
      const result = await db.execute('SELECT * FROM diasEntrega ORDER BY descripcion');
      logger.debug('Días de entrega obtenidos:', result.rows.length);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo días de entrega:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      if (!id || id === null || id === undefined) {
        logger.warning('ID de día de entrega no proporcionado o inválido:', id);
        return null;
      }
      
      // Convertir a número si es string
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(numericId)) {
        logger.warning('ID de día de entrega no es un número válido:', id);
        return null;
      }
      
      const result = await db.execute({
        sql: 'SELECT * FROM diasEntrega WHERE id = ?',
        args: [numericId]
      });
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error obteniendo día de entrega por ID:', error);
      throw error;
    }
  },

  async create(diaData) {
    try {
      const { descripcion } = diaData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `INSERT INTO diasEntrega (descripcion, created_at, updated_at) 
              VALUES (?, ?, ?) RETURNING *`,
        args: [descripcion, now, now]
      });
      
      logger.success('Día de entrega creado:', result.rows[0].id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creando día de entrega:', error);
      throw error;
    }
  },

  async update(id, diaData) {
    try {
      const { descripcion } = diaData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `UPDATE diasEntrega SET descripcion = ?, updated_at = ? 
              WHERE id = ? RETURNING *`,
        args: [descripcion, now, id]
      });
      
      logger.success('Día de entrega actualizado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error actualizando día de entrega:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const result = await db.execute({
        sql: 'DELETE FROM diasEntrega WHERE id = ? RETURNING *',
        args: [id]
      });
      
      logger.success('Día de entrega eliminado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error eliminando día de entrega:', error);
      throw error;
    }
  },

  async count() {
    try {
      const result = await db.execute('SELECT COUNT(*) as count FROM diasEntrega');
      return result.rows[0].count;
    } catch (error) {
      logger.error('Error contando días de entrega:', error);
      throw error;
    }
  },

  async deleteAll() {
    try {
      const result = await db.execute('DELETE FROM diasEntrega');
      logger.warning('Todos los días de entrega eliminados');
      return result.rowsAffected;
    } catch (error) {
      logger.error('Error eliminando todos los días de entrega:', error);
      throw error;
    }
  }
}; 