import { db } from '../database.js';
import { logger } from '../logger.js';

export const clienteporRepartoService = {
  async getAll() {
    try {
      const result = await db.execute('SELECT * FROM clientesporReparto ORDER BY created_at DESC');
      logger.debug('Clientes por reparto obtenidos:', result.rows.length);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo clientes por reparto:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM clientesporReparto WHERE id = ?',
        args: [id]
      });
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error obteniendo cliente por reparto por ID:', error);
      throw error;
    }
  },

  async create(clienteporRepartoData) {
    try {
      const { clientId, repartoId } = clienteporRepartoData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `INSERT INTO clientesporReparto (cliente_id, reparto_id, created_at, updated_at) 
              VALUES (?, ?, ?, ?) RETURNING *`,
        args: [clientId, repartoId, now, now]
      });
      
      logger.success('Cliente por reparto creado:', result.rows[0].id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creando cliente por reparto:', error);
      throw error;
    }
  },

  async update(id, clienteporRepartoData) {
    try {
      const { clientId, repartoId } = clienteporRepartoData;
      const now = new Date().toISOString();
      
      const result = await db.execute({
        sql: `UPDATE clientesporReparto SET cliente_id = ?, reparto_id = ?, updated_at = ? 
              WHERE id = ? RETURNING *`,
        args: [clientId, repartoId, now, id]
      });
      
      logger.success('Cliente por reparto actualizado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error actualizando cliente por reparto:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const result = await db.execute({
        sql: 'DELETE FROM clientesporReparto WHERE id = ? RETURNING *',
        args: [id]
      });
      
      logger.success('Cliente por reparto eliminado:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error eliminando cliente por reparto:', error);
      throw error;
    }
  },

  async count() {
    try {
      const result = await db.execute('SELECT COUNT(*) as count FROM clientesporReparto');
      return result.rows[0].count;
    } catch (error) {
      logger.error('Error contando clientes por reparto:', error);
      throw error;
    }
  },

  async deleteAll() {
    try {
      const result = await db.execute('DELETE FROM clientesporReparto');
      logger.warning('Todos los clientes por reparto eliminados');
      return result.rowsAffected;
    } catch (error) {
      logger.error('Error eliminando todos los clientes por reparto:', error);
      throw error;
    }
  }
}; 