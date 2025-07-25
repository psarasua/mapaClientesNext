import prisma from '../prisma.js';
import { hashPassword } from '../auth.js';

class PrismaAdapter {
  constructor() {
    this.prisma = prisma;
  }

  getDatabaseInfo() {
    return {
      type: 'SQLite',
      adapter: 'Prisma ORM',
      version: '6.12.0',
      status: 'connected'
    };
  }

  // ===== MÉTODOS PARA USUARIOS =====
  
  async getAllUsers() {
    return await this.prisma.user.findMany({
      orderBy: { created_at: 'desc' }
    });
  }

  async getUserById(id) {
    return await this.prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async getUserByUsername(usuario) {
    return await this.prisma.user.findUnique({
      where: { usuario }
    });
  }

  async createUser(userData) {
    const hashedPassword = await hashPassword(userData.password);
    return await this.prisma.user.create({
      data: {
        usuario: userData.usuario,
        password: hashedPassword
      }
    });
  }

  async updateUser(id, userData) {
    const updateData = { ...userData };
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    return await this.prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  }

  async deleteUser(id) {
    return await this.prisma.user.delete({
      where: { id: parseInt(id) }
    });
  }

  async clearAllUsers() {
    const result = await this.prisma.user.deleteMany();
    return { deletedCount: result.count };
  }

  // ===== MÉTODOS PARA CLIENTES =====
  
  async getAllClients() {
    const clients = await this.prisma.client.findMany({
      orderBy: { created_at: 'desc' }
    });

    // Transformar los datos para mantener compatibilidad con nombres de columnas originales
    return clients.map(client => ({
      ...client,
      Codigo: client.codigo,
      Razon: client.razon,
      Nombre: client.nombre,
      Direccion: client.direccion,
      Telefono1: client.telefono1,
      Ruc: client.ruc,
      Activo: client.activo,
      Coordenada_x: client.coordenada_x,
      Coordenada_y: client.coordenada_y
    }));
  }

  async getClientById(id) {
    return await this.prisma.client.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async getClientByCode(codigo) {
    return await this.prisma.client.findUnique({
      where: { codigo }
    });
  }

  async createClient(clientData) {
    return await this.prisma.client.create({
      data: {
        codigo: clientData.Codigo,
        razon: clientData.Razon || null,
        nombre: clientData.Nombre,
        direccion: clientData.Direccion || null,
        telefono1: clientData.Telefono1 || null,
        ruc: clientData.Ruc || null,
        activo: clientData.Activo || 1,
        coordenada_x: clientData.Coordenada_x || null,
        coordenada_y: clientData.Coordenada_y || null
      }
    });
  }

  async updateClient(id, clientData) {
    return await this.prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        codigo: clientData.Codigo,
        razon: clientData.Razon || null,
        nombre: clientData.Nombre,
        direccion: clientData.Direccion || null,
        telefono1: clientData.Telefono1 || null,
        ruc: clientData.Ruc || null,
        activo: clientData.Activo || 1,
        coordenada_x: clientData.Coordenada_x || null,
        coordenada_y: clientData.Coordenada_y || null
      }
    });
  }

  async deleteClient(id) {
    return await this.prisma.client.delete({
      where: { id: parseInt(id) }
    });
  }

  async clearAllClients() {
    const result = await this.prisma.client.deleteMany();
    return { deletedCount: result.count };
  }

  // ===== MÉTODOS PARA CAMIONES =====
  
  async getAllTrucks() {
    return await this.prisma.truck.findMany({
      orderBy: { created_at: 'desc' }
    });
  }

  async getTruckById(id) {
    return await this.prisma.truck.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async createTruck(truckData) {
    return await this.prisma.truck.create({
      data: {
        description: truckData.description
      }
    });
  }

  async updateTruck(id, truckData) {
    return await this.prisma.truck.update({
      where: { id: parseInt(id) },
      data: {
        description: truckData.description
      }
    });
  }

  async deleteTruck(id) {
    return await this.prisma.truck.delete({
      where: { id: parseInt(id) }
    });
  }

  async clearAllTrucks() {
    // Con Prisma, las relaciones CASCADE se manejan automáticamente
    const result = await this.prisma.truck.deleteMany();
    return { 
      deletedCount: result.count,
      details: {
        trucks: result.count,
        repartos: 'handled by cascade',
        clientesReparto: 'handled by cascade'
      }
    };
  }

  // ===== MÉTODOS PARA DÍAS DE ENTREGA =====
  
  async getAllDiasEntrega() {
    return await this.prisma.diaEntrega.findMany({
      orderBy: { created_at: 'desc' }
    });
  }

  async getDiaEntregaById(id) {
    return await this.prisma.diaEntrega.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async createDiaEntrega(diaData) {
    return await this.prisma.diaEntrega.create({
      data: {
        descripcion: diaData.descripcion
      }
    });
  }

  async updateDiaEntrega(id, diaData) {
    return await this.prisma.diaEntrega.update({
      where: { id: parseInt(id) },
      data: {
        descripcion: diaData.descripcion
      }
    });
  }

  async deleteDiaEntrega(id) {
    return await this.prisma.diaEntrega.delete({
      where: { id: parseInt(id) }
    });
  }

  async clearAllDiasEntrega() {
    const result = await this.prisma.diaEntrega.deleteMany();
    return { deletedCount: result.count };
  }

  // ===== MÉTODOS PARA REPARTOS =====
  
  async getAllRepartos() {
    const repartos = await this.prisma.reparto.findMany({
      include: {
        diaEntrega: true,
        camion: true
      },
      orderBy: { created_at: 'desc' }
    });

    // Transformar los datos para mantener compatibilidad con el frontend
    return repartos.map(reparto => ({
      ...reparto,
      dia_descripcion: reparto.diaEntrega.descripcion,
      camion_descripcion: reparto.camion.description
    }));
  }

  async getRepartoById(id) {
    return await this.prisma.reparto.findUnique({
      where: { id: parseInt(id) },
      include: {
        diaEntrega: true,
        camion: true
      }
    });
  }

  async createReparto(repartoData) {
    return await this.prisma.reparto.create({
      data: {
        diasEntrega_id: parseInt(repartoData.diasEntrega_id),
        camion_id: parseInt(repartoData.camion_id)
      },
      include: {
        diaEntrega: true,
        camion: true
      }
    });
  }

  async updateReparto(id, repartoData) {
    return await this.prisma.reparto.update({
      where: { id: parseInt(id) },
      data: {
        diasEntrega_id: parseInt(repartoData.diasEntrega_id),
        camion_id: parseInt(repartoData.camion_id)
      },
      include: {
        diaEntrega: true,
        camion: true
      }
    });
  }

  async deleteReparto(id) {
    return await this.prisma.reparto.delete({
      where: { id: parseInt(id) }
    });
  }

  async clearAllRepartos() {
    const result = await this.prisma.reparto.deleteMany();
    return { deletedCount: result.count };
  }

  // ===== MÉTODOS PARA CLIENTES POR REPARTO =====
  
  async getAllClientesporReparto() {
    const clientesporReparto = await this.prisma.clienteporReparto.findMany({
      include: {
        reparto: {
          include: {
            diaEntrega: true,
            camion: true
          }
        },
        cliente: true
      },
      orderBy: { created_at: 'desc' }
    });

    // Transformar los datos para mantener compatibilidad con el frontend
    return clientesporReparto.map(item => ({
      ...item,
      dia_descripcion: item.reparto.diaEntrega.descripcion,
      camion_descripcion: item.reparto.camion.description,
      cliente_nombre: item.cliente.nombre,
      cliente_razonsocial: item.cliente.razon,
      cliente_direccion: item.cliente.direccion,
      cliente_telefono: item.cliente.telefono1,
      cliente_rut: item.cliente.ruc
    }));
  }

  async getClienteporRepartoById(id) {
    return await this.prisma.clienteporReparto.findUnique({
      where: { id: parseInt(id) },
      include: {
        reparto: {
          include: {
            diaEntrega: true,
            camion: true
          }
        },
        cliente: true
      }
    });
  }

  async createClienteporReparto(data) {
    return await this.prisma.clienteporReparto.create({
      data: {
        reparto_id: parseInt(data.reparto_id),
        cliente_id: parseInt(data.cliente_id)
      },
      include: {
        reparto: {
          include: {
            diaEntrega: true,
            camion: true
          }
        },
        cliente: true
      }
    });
  }

  async updateClienteporReparto(id, data) {
    return await this.prisma.clienteporReparto.update({
      where: { id: parseInt(id) },
      data: {
        reparto_id: parseInt(data.reparto_id),
        cliente_id: parseInt(data.cliente_id)
      },
      include: {
        reparto: {
          include: {
            diaEntrega: true,
            camion: true
          }
        },
        cliente: true
      }
    });
  }

  async deleteClienteporReparto(id) {
    return await this.prisma.clienteporReparto.delete({
      where: { id: parseInt(id) }
    });
  }

  async clearAllClientesporReparto() {
    const result = await this.prisma.clienteporReparto.deleteMany();
    return { deletedCount: result.count };
  }

  // ===== MÉTODOS DE UTILIDAD =====

  async clearAllTables() {
    // Eliminar en orden correcto para evitar violaciones de foreign key
    const clientesporReparto = await this.prisma.clienteporReparto.deleteMany();
    const repartos = await this.prisma.reparto.deleteMany();
    const clients = await this.prisma.client.deleteMany();
    const trucks = await this.prisma.truck.deleteMany();
    const diasEntrega = await this.prisma.diaEntrega.deleteMany();
    const users = await this.prisma.user.deleteMany();

    return {
      clientesporReparto: clientesporReparto.count,
      repartos: repartos.count,
      clients: clients.count,
      trucks: trucks.count,
      diasEntrega: diasEntrega.count,
      users: users.count
    };
  }
}

export default PrismaAdapter;
