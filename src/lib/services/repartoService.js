import { db } from '../database.js';
import { logger } from '../logger.js';

export const repartoService = {
  async getAll() {
    try {
      const result = await db.execute('SELECT * FROM repartos ORDER BY created_at DESC');
      logger.debug('Repartos obtenidos:', result.rows.length);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo repartos:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      if (!id || id === null || id === undefined) {
        logger.warning('ID de reparto no proporcionado o inválido:', id);
        return null;
      }
      
      // Convertir a número si es string
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(numericId)) {
        logger.warning('ID de reparto no es un número válido:', id);
        return null;
      }
      
      const result = await db.execute({
        sql: 'SELECT * FROM repartos WHERE id = ?',
        args: [numericId]
      });
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error obteniendo reparto por ID:', error);
      throw error;
    }
  },

  async create(repartoData) {
    try {
      const { nombre, descripcion } = repartoData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `INSERT INTO repartos (nombre, descripcion, created_at, updated_at) 
              VALUES (?, ?, ?, ?) RETURNING *`,
        args: [nombre, descripcion, now, now]
      });
      
      logger.success('Reparto creado:', result.rows[0].id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creando reparto:', error);
      throw error;
    }
  },

  async update(id, repartoData) {
    try {
      const { nombre, descripcion } = repartoData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `UPDATE repartos SET nombre = ?, descripcion = ?, updated_at = ? 
              WHERE id = ? RETURNING *`,
        args: [nombre, descripcion, now, id]
      });
      
      logger.success('Reparto actualizado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error actualizando reparto:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const result = await db.execute({
        sql: 'DELETE FROM repartos WHERE id = ? RETURNING *',
        args: [id]
      });
      
      logger.success('Reparto eliminado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error eliminando reparto:', error);
      throw error;
    }
  },

  async count() {
    try {
      const result = await db.execute('SELECT COUNT(*) as count FROM repartos');
      return result.rows[0].count;
    } catch (error) {
      logger.error('Error contando repartos:', error);
      throw error;
    }
  },

  async deleteAll() {
    try {
      const result = await db.execute('DELETE FROM repartos');
      logger.warning('Todos los repartos eliminados');
      return result.rowsAffected;
    } catch (error) {
      logger.error('Error eliminando todos los repartos:', error);
      throw error;
    }
  }
}; 