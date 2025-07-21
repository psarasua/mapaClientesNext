import { validateCreateUserData, validateCreateTruckData, validateCreateClientData, validateCreateDiaEntregaData, validateCreateRepartoData, validateCreateClienteporRepartoData } from '../types/index.js';

const API_BASE_URL = '/api';

// Función helper para manejar respuestas
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Función helper para extraer datos específicos de la respuesta
async function handleResponseData(response, dataKey) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data[dataKey] || data;
}

// API para usuarios
export const userApi = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    return handleResponse(response);
  },

  // Crear un nuevo usuario
  create: async (userData) => {
    if (!validateCreateUserData(userData)) {
      throw new Error('Datos de usuario inválidos');
    }
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Actualizar un usuario
  update: async (userData) => {
    if (!userData.id) {
      throw new Error('ID de usuario requerido para actualización');
    }
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Eliminar un usuario
  delete: async (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('ID de usuario inválido');
    }
    
    const response = await fetch(`${API_BASE_URL}/users?id=${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para camiones
export const truckApi = {
  // Obtener todos los camiones
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/trucks`);
    return handleResponse(response);
  },

  // Crear un nuevo camión
  create: async (truckData) => {
    if (!validateCreateTruckData(truckData)) {
      throw new Error('Datos de camión inválidos');
    }
    
    const response = await fetch(`${API_BASE_URL}/trucks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(truckData),
    });
    return handleResponse(response);
  },

  // Actualizar un camión
  update: async (truckData) => {
    if (!truckData.id) {
      throw new Error('ID de camión requerido para actualización');
    }
    
    const response = await fetch(`${API_BASE_URL}/trucks`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(truckData),
    });
    return handleResponse(response);
  },

  // Eliminar un camión
  delete: async (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('ID de camión inválido');
    }
    
    const response = await fetch(`${API_BASE_URL}/trucks?id=${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para clientes
export const clientApi = {
  // Obtener todos los clientes
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/clients`);
    const data = await handleResponseData(response, 'clients');
    return data;
  },

  // Crear un nuevo cliente
  create: async (clientData) => {
    if (!validateCreateClientData(clientData)) {
      throw new Error('Datos de cliente inválidos');
    }
    
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    return handleResponse(response);
  },

  // Actualizar un cliente
  update: async (clientData) => {
    if (!clientData.id) {
      throw new Error('ID de cliente requerido para actualización');
    }
    
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    return handleResponse(response);
  },

  // Eliminar un cliente
  delete: async (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('ID de cliente inválido');
    }
    
    const response = await fetch(`${API_BASE_URL}/clients?id=${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para días de entrega
export const diaEntregaApi = {
  // Obtener todos los días de entrega
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/diasEntrega`);
    return handleResponse(response);
  },

  // Crear un nuevo día de entrega
  create: async (diaEntregaData) => {
    if (!validateCreateDiaEntregaData(diaEntregaData)) {
      throw new Error('Datos de día de entrega inválidos');
    }
    
    const response = await fetch(`${API_BASE_URL}/diasEntrega`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diaEntregaData),
    });
    return handleResponse(response);
  },

  // Actualizar un día de entrega
  update: async (diaEntregaData) => {
    if (!diaEntregaData.id) {
      throw new Error('ID de día de entrega requerido para actualización');
    }
    
    const response = await fetch(`${API_BASE_URL}/diasEntrega`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diaEntregaData),
    });
    return handleResponse(response);
  },

  // Eliminar un día de entrega
  delete: async (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('ID de día de entrega inválido');
    }
    
    const response = await fetch(`${API_BASE_URL}/diasEntrega?id=${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para repartos
export const repartoApi = {
  // Obtener todos los repartos
  getAll: async (params = {}) => {
    let url = `${API_BASE_URL}/repartos`;
    const queryParams = new URLSearchParams();
    
    if (params.dia) queryParams.append('dia', params.dia);
    if (params.camion) queryParams.append('camion', params.camion);
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const response = await fetch(url);
    const data = await handleResponseData(response, 'repartos');
    return data;
  },

  // Crear un nuevo reparto
  create: async (repartoData) => {
    if (!validateCreateRepartoData(repartoData)) {
      throw new Error('Datos de reparto inválidos');
    }
    
    const response = await fetch(`${API_BASE_URL}/repartos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repartoData),
    });
    return handleResponse(response);
  },

  // Actualizar un reparto
  update: async (repartoData) => {
    if (!repartoData.id) {
      throw new Error('ID de reparto requerido para actualización');
    }
    
    const response = await fetch(`${API_BASE_URL}/repartos`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(repartoData),
    });
    return handleResponse(response);
  },

  // Eliminar un reparto
  delete: async (id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('ID de reparto inválido');
    }
    
    const response = await fetch(`${API_BASE_URL}/repartos?id=${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// API para health check
export const healthApi = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
};

// Función helper para manejar errores de API
export const handleApiError = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Error desconocido en la API';
};

// Storage local como fallback
export const localStorageApi = {
  getUsers: () => {
    try {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error leyendo usuarios del localStorage:', error);
      return [];
    }
  },

  setUsers: (users) => {
    try {
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error guardando usuarios en localStorage:', error);
      return false;
    }
  },

  addUser: (user) => {
    const users = localStorageApi.getUsers();
    const newUser = {
      ...user,
      id: Date.now(), // ID simple basado en timestamp
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorageApi.setUsers(users);
    return newUser;
  },

  updateUser: (id, userData) => {
    const users = localStorageApi.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...userData,
        updated_at: new Date().toISOString()
      };
      localStorageApi.setUsers(users);
      return users[index];
    }
    return null;
  },

  deleteUser: (id) => {
    const users = localStorageApi.getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    const wasDeleted = users.length !== filteredUsers.length;
    if (wasDeleted) {
      localStorageApi.setUsers(filteredUsers);
    }
    return wasDeleted;
  },

  clear: () => {
    try {
      localStorage.removeItem('users');
      return true;
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
      return false;
    }
  }
};

// API para ClientesporReparto
export const clientesporRepartoApi = {
  // Obtener todos los ClientesporReparto o filtrar por reparto/cliente
  getAll: async (filters = {}) => {
    try {
      const searchParams = new URLSearchParams();
      
      if (filters.reparto) {
        searchParams.append('reparto', filters.reparto.toString());
      }
      
      if (filters.cliente) {
        searchParams.append('cliente', filters.cliente.toString());
      }
      
      const url = `${API_BASE_URL}/clientesporreparto${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      return data.clientesporReparto || [];
    } catch (error) {
      console.error('Error obteniendo clientesporreparto:', error);
      throw error;
    }
  },

  // Obtener ClientesporReparto por ID de reparto
  getByReparto: async (repartoId) => {
    return clientesporRepartoApi.getAll({ reparto: repartoId });
  },

  // Obtener ClientesporReparto por ID de cliente
  getByCliente: async (clienteId) => {
    return clientesporRepartoApi.getAll({ cliente: clienteId });
  },

  // Crear nuevo ClienteporReparto
  create: async (data) => {
    try {
      const validation = validateCreateClienteporRepartoData(data);
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }

      const response = await fetch(`${API_BASE_URL}/clientesporreparto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result.clienteporReparto || result;
    } catch (error) {
      console.error('Error creando clienteporreparto:', error);
      throw error;
    }
  },

  // Actualizar ClienteporReparto
  update: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clientesporreparto`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result.clienteporReparto || result;
    } catch (error) {
      console.error('Error actualizando clienteporreparto:', error);
      throw error;
    }
  },

  // Eliminar ClienteporReparto
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clientesporreparto?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error eliminando clienteporreparto:', error);
      throw error;
    }
  }
};
