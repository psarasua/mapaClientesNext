import { db } from '../database.js';
import { logger } from '../logger.js';

export const userService = {
  async getAll() {
    try {
      const result = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
      logger.debug('Usuarios obtenidos:', result.rows.length);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo usuarios:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM users WHERE id = ?',
        args: [id]
      });
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error obteniendo usuario por ID:', error);
      throw error;
    }
  },

  async getByUsuario(usuario) {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM users WHERE usuario = ?',
        args: [usuario]
      });
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error obteniendo usuario por nombre:', error);
      throw error;
    }
  },

  async create(userData) {
    try {
      const { usuario, password } = userData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `INSERT INTO users (usuario, password, created_at, updated_at) 
              VALUES (?, ?, ?, ?) RETURNING *`,
        args: [usuario, password, now, now]
      });
      
      logger.success('Usuario creado:', result.rows[0].id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creando usuario:', error);
      throw error;
    }
  },

  async update(id, userData) {
    try {
      const { usuario } = userData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `UPDATE users SET usuario = ?, updated_at = ? 
              WHERE id = ? RETURNING *`,
        args: [usuario, now, id]
      });
      
      logger.success('Usuario actualizado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error actualizando usuario:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const result = await db.execute({
        sql: 'DELETE FROM users WHERE id = ? RETURNING *',
        args: [id]
      });
      
      logger.success('Usuario eliminado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error eliminando usuario:', error);
      throw error;
    }
  },

  async count() {
    try {
      const result = await db.execute('SELECT COUNT(*) as count FROM users');
      return result.rows[0].count;
    } catch (error) {
      logger.error('Error contando usuarios:', error);
      throw error;
    }
  },

  async deleteAll() {
    try {
      const result = await db.execute('DELETE FROM users');
      logger.warning('Todos los usuarios eliminados');
      return result.rowsAffected;
    } catch (error) {
      logger.error('Error eliminando todos los usuarios:', error);
      throw error;
    }
  }
}; 