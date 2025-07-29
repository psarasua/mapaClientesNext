// Adaptador de base de datos - Soporte para Prisma, SQLite local y Turso en producción
import SQLiteDatabase from './sqlite.js';
import TursoDatabase from './turso.js';
import PrismaAdapter from './prisma-adapter.js';

class DatabaseAdapter {
  constructor() {
    this.database = null;
  }

  async init() {
    if (!this.database) {
      // Usar Turso en producción, Prisma en desarrollo
      if (process.env.NODE_ENV === 'production' && process.env.TURSO_DATABASE_URL) {
        console.log('🟡 Inicializando Turso Database (Producción)...');
        this.database = new TursoDatabase();
        await this.database.init(); // Inicializar la conexión de Turso
      } else {
        console.log('🟢 Inicializando Prisma Adapter (Desarrollo)...');
        this.database = new PrismaAdapter();
      }
    }
    return this.database;
  }

  getDatabaseInfo() {
    return this.database?.getDatabaseInfo?.() || { type: 'Unknown', status: 'disconnected' };
  }

  // ===== DELEGACIÓN DE MÉTODOS =====
  
  // Usuarios
  async getAllUsers() {
    const db = await this.init();
    return await db.getAllUsers();
  }

  async getUserById(id) {
    const db = await this.init();
    return await db.getUserById(id);
  }

  async getUserByUsername(usuario) {
    const db = await this.init();
    return await db.getUserByUsername(usuario);
  }

  async createUser(userData) {
    const db = await this.init();
    return await db.createUser(userData);
  }

  async updateUser(id, userData) {
    const db = await this.init();
    return await db.updateUser(id, userData);
  }

  async deleteUser(id) {
    const db = await this.init();
    return await db.deleteUser(id);
  }

  async clearAllUsers() {
    const db = await this.init();
    return await db.clearAllUsers();
  }

  // Clientes
  async getAllClients() {
    const db = await this.init();
    return await db.getAllClients();
  }

  async getClientById(id) {
    const db = await this.init();
    return await db.getClientById(id);
  }

  async getClientByCode(codigo) {
    const db = await this.init();
    return await db.getClientByCode(codigo);
  }

  async createClient(clientData) {
    const db = await this.init();
    return await db.createClient(clientData);
  }

  async updateClient(id, clientData) {
    const db = await this.init();
    return await db.updateClient(id, clientData);
  }

  async deleteClient(id) {
    const db = await this.init();
    return await db.deleteClient(id);
  }

  async clearAllClients() {
    const db = await this.init();
    return await db.clearAllClients();
  }

  // Camiones
  async getAllTrucks() {
    const db = await this.init();
    return await db.getAllTrucks();
  }

  async getTruckById(id) {
    const db = await this.init();
    return await db.getTruckById(id);
  }

  async createTruck(truckData) {
    const db = await this.init();
    return await db.createTruck(truckData);
  }

  async updateTruck(id, truckData) {
    const db = await this.init();
    return await db.updateTruck(id, truckData);
  }

  async deleteTruck(id) {
    const db = await this.init();
    return await db.deleteTruck(id);
  }

  async clearAllTrucks() {
    const db = await this.init();
    return await db.clearAllTrucks();
  }

  // Días de entrega
  async getAllDiasEntrega() {
    const db = await this.init();
    return await db.getAllDiasEntrega();
  }

  async getDiaEntregaById(id) {
    const db = await this.init();
    return await db.getDiaEntregaById(id);
  }

  async createDiaEntrega(diaData) {
    const db = await this.init();
    return await db.createDiaEntrega(diaData);
  }

  async updateDiaEntrega(id, diaData) {
    const db = await this.init();
    return await db.updateDiaEntrega(id, diaData);
  }

  async deleteDiaEntrega(id) {
    const db = await this.init();
    return await db.deleteDiaEntrega(id);
  }

  async clearAllDiasEntrega() {
    const db = await this.init();
    return await db.clearAllDiasEntrega();
  }

  // Repartos
  async getAllRepartos() {
    const db = await this.init();
    return await db.getAllRepartos();
  }

  async getRepartoById(id) {
    const db = await this.init();
    return await db.getRepartoById(id);
  }

  async createReparto(repartoData) {
    const db = await this.init();
    return await db.createReparto(repartoData);
  }

  async updateReparto(id, repartoData) {
    const db = await this.init();
    return await db.updateReparto(id, repartoData);
  }

  async deleteReparto(id) {
    const db = await this.init();
    return await db.deleteReparto(id);
  }

  async clearAllRepartos() {
    const db = await this.init();
    return await db.clearAllRepartos();
  }

  // Métodos adicionales para filtros específicos
  async getRepartosByDia(diaEntregaId) {
    const db = await this.init();
    return await db.getRepartosByDia(diaEntregaId);
  }

  async getRepartosByCamion(camionId) {
    const db = await this.init();
    return await db.getRepartosByCamion(camionId);
  }

  // Clientes por reparto
  async getAllClientesporReparto() {
    const db = await this.init();
    return await db.getAllClientesporReparto();
  }

  async getClienteporRepartoById(id) {
    const db = await this.init();
    return await db.getClienteporRepartoById(id);
  }

  async getClientesporRepartoByReparto(repartoId) {
    const db = await this.init();
    return await db.getClientesporRepartoByReparto(repartoId);
  }

  async getClientesporRepartoByCliente(clienteId) {
    const db = await this.init();
    return await db.getClientesporRepartoByCliente(clienteId);
  }

  async createClienteporReparto(data) {
    const db = await this.init();
    return await db.createClienteporReparto(data);
  }

  async updateClienteporReparto(id, data) {
    const db = await this.init();
    return await db.updateClienteporReparto(id, data);
  }

  async deleteClienteporReparto(id) {
    const db = await this.init();
    return await db.deleteClienteporReparto(id);
  }

  async clearAllClientesporReparto() {
    const db = await this.init();
    return await db.clearAllClientesporReparto();
  }

  // Métodos de utilidad
  async clearAllTables() {
    const db = await this.init();
    return await db.clearAllTables?.() || {};
  }
}

export default DatabaseAdapter;
