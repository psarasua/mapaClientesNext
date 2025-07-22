// Adaptador de base de datos usando SQLite
import SQLiteDatabase from './sqlite.js';

class DatabaseAdapter {
  constructor() {
    this.database = null;
  }

  async init() {
    if (!this.database) {
      console.log('🟡 Inicializando SQLite Database...');
      this.database = new SQLiteDatabase();
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

  async getAllClients() {
    await this.init();
    return await this.database.getAllClients();
  }

  async getClientById(id) {
    await this.init();
    return await this.database.getClientById(id);
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

  async getAllClientesporReparto() {
    await this.init();
    return await this.database.getAllClientesporReparto();
  }

  async close() {
    if (this.database) {
      await this.database.close();
    }
  }

  // Método para obtener información del ambiente
  getDatabaseInfo() {
    return {
      type: 'SQLite (Local)',
      environment: process.env.NODE_ENV || 'development',
      isProduction: false
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
