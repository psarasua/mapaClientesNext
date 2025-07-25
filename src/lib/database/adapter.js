// Adaptador de base de datos - Soporte para SQLite local y Turso en producción
import SQLiteDatabase from './sqlite.js';
import TursoDatabase from './turso.js';

class DatabaseAdapter {
  constructor() {
    this.database = null;
  }

  async init() {
    if (!this.database) {
      // Usar Turso en producción, SQLite en desarrollo
      if (process.env.NODE_ENV === 'production' && process.env.TURSO_DATABASE_URL) {
        console.log('🟡 Inicializando Turso Database (Producción)...');
        this.database = new TursoDatabase();
      } else {
        console.log('🟡 Inicializando SQLite Database (Local)...');
        this.database = new SQLiteDatabase();
      }
    }
    return await this.database.init();
  }

  // Proxy methods - delegar todos los métodos a la base de datos activa
  async getAllUsers() {
    await this.init();
    return await this.database.getAllUsers();
  }

  async getUserById(id) {
    await this.init();
    return await this.database.getUserById(id);
  }

  async createUser(userData) {
    await this.init();
    return await this.database.createUser(userData);
  }

  async updateUser(id, userData) {
    await this.init();
    return await this.database.updateUser(id, userData);
  }

  async deleteUser(id) {
    await this.init();
    return await this.database.deleteUser(id);
  }

  async searchUsers(query) {
    await this.init();
    return await this.database.searchUsers(query);
  }

  async getUsersCount() {
    await this.init();
    return await this.database.getUsersCount();
  }

  async getAllTrucks() {
    await this.init();
    return await this.database.getAllTrucks();
  }

  async getTruckById(id) {
    await this.init();
    return await this.database.getTruckById(id);
  }

  async createTruck(truckData) {
    await this.init();
    return await this.database.createTruck(truckData);
  }

  async updateTruck(id, truckData) {
    await this.init();
    return await this.database.updateTruck(id, truckData);
  }

  async deleteTruck(id) {
    await this.init();
    return await this.database.deleteTruck(id);
  }

  async seedInitialTrucks() {
    await this.init();
    return await this.database.seedInitialTrucks();
  }

  async getAllClients() {
    await this.init();
    return await this.database.getAllClients();
  }

  async getClientById(id) {
    await this.init();
    return await this.database.getClientById(id);
  }

  async getClientByCode(codigo) {
    await this.init();
    return await this.database.getClientByCode(codigo);
  }

  async createClient(clientData) {
    await this.init();
    return await this.database.createClient(clientData);
  }

  async updateClient(id, clientData) {
    await this.init();
    return await this.database.updateClient(id, clientData);
  }

  async deleteClient(id) {
    await this.init();
    return await this.database.deleteClient(id);
  }

  async searchClients(query) {
    await this.init();
    return await this.database.searchClients(query);
  }

  async getAllDiasEntrega() {
    await this.init();
    return await this.database.getAllDiasEntrega();
  }

  async getAllRepartos() {
    await this.init();
    return await this.database.getAllRepartos();
  }

  async getRepartosByDia(diaId) {
    await this.init();
    return await this.database.getRepartosByDia(diaId);
  }

  async getRepartosByCamion(camionId) {
    await this.init();
    return await this.database.getRepartosByCamion(camionId);
  }

  async getRepartoById(id) {
    await this.init();
    return await this.database.getRepartoById(id);
  }

  async createReparto(data) {
    await this.init();
    return await this.database.createReparto(data);
  }

  async updateReparto(id, data) {
    await this.init();
    return await this.database.updateReparto(id, data);
  }

  async deleteReparto(id) {
    await this.init();
    return await this.database.deleteReparto(id);
  }

  async seedInitialRepartos() {
    await this.init();
    return await this.database.seedInitialRepartos();
  }

  async getAllClientesporReparto() {
    await this.init();
    return await this.database.getAllClientesporReparto();
  }

  async getClientesporRepartoByReparto(repartoId) {
    await this.init();
    return await this.database.getClientesporRepartoByReparto(repartoId);
  }

  async getClientesporRepartoByCliente(clienteId) {
    await this.init();
    return await this.database.getClientesporRepartoByCliente(clienteId);
  }

  async getClienteporRepartoById(id) {
    await this.init();
    return await this.database.getClienteporRepartoById(id);
  }

  async createClienteporReparto(data) {
    await this.init();
    return await this.database.createClienteporReparto(data);
  }

  async updateClienteporReparto(id, data) {
    await this.init();
    return await this.database.updateClienteporReparto(id, data);
  }

  async deleteClienteporReparto(id) {
    await this.init();
    return await this.database.deleteClienteporReparto(id);
  }

  async getClientesporRepartoCount() {
    await this.init();
    return await this.database.getClientesporRepartoCount();
  }

  async searchClientesporReparto(searchTerm) {
    await this.init();
    return await this.database.searchClientesporReparto(searchTerm);
  }

  async seedInitialClientesporReparto() {
    await this.init();
    return await this.database.seedInitialClientesporReparto();
  }

  async close() {
    if (this.database) {
      await this.database.close();
    }
  }

  // Métodos de limpieza de datos
  async clearAllUsers() {
    await this.init();
    return await this.database.clearAllUsers();
  }

  async clearAllClients() {
    await this.init();
    return await this.database.clearAllClients();
  }

  async clearAllTrucks() {
    await this.init();
    return await this.database.clearAllTrucks();
  }

  async clearAllRepartos() {
    await this.init();
    return await this.database.clearAllRepartos();
  }

  async clearAllDiasEntrega() {
    await this.init();
    return await this.database.clearAllDiasEntrega();
  }

  async clearAllClientesporReparto() {
    await this.init();
    return await this.database.clearAllClientesporReparto();
  }

  // Métodos específicos de autenticación
  async getUserByUsernameOrEmail(usernameOrEmail) {
    await this.init();
    return await this.database.getUserByUsernameOrEmail(usernameOrEmail);
  }

  async getUserByEmail(email) {
    await this.init();
    return await this.database.getUserByEmail(email);
  }

  async updateUserLastLogin(userId) {
    await this.init();
    return await this.database.updateUserLastLogin(userId);
  }

  async updateUserResetToken(userId, resetToken, resetTokenExpires) {
    await this.init();
    return await this.database.updateUserResetToken(userId, resetToken, resetTokenExpires);
  }

  async getUserByResetToken(resetToken) {
    await this.init();
    return await this.database.getUserByResetToken(resetToken);
  }

  async updateUserPassword(userId, hashedPassword) {
    await this.init();
    return await this.database.updateUserPassword(userId, hashedPassword);
  }

  async clearUserResetToken(userId) {
    await this.init();
    return await this.database.clearUserResetToken(userId);
  }

  // Método para obtener información del ambiente
  getDatabaseInfo() {
    const isProduction = process.env.NODE_ENV === 'production' && process.env.TURSO_DATABASE_URL;
    return {
      type: isProduction ? 'Turso (Cloud)' : 'SQLite (Local)',
      environment: process.env.NODE_ENV || 'development',
      isProduction: isProduction
    };
  }
}

// Singleton instance
let databaseInstance = null;

export function getDatabase() {
  if (!databaseInstance) {
    databaseInstance = new DatabaseAdapter();
  }
  return databaseInstance;
}

export default DatabaseAdapter;
