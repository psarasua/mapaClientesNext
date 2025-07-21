/**
 * Estructuras de datos del proyecto
 * 
 * User: {
 *   id: number,
 *   name: string,
 *   email: string,
 *   age: number,
 *   phone?: string,
 *   role?: 'user' | 'admin' | 'moderator',
 *   created_at?: string,
 *   updated_at?: string
 * }
 * 
 * Truck: {
 *   id: number,
 *   description: string,
 *   brand?: string,
 *   model?: string,
 *   year?: number,
 *   license_plate?: string,
 *   capacity?: string,
 *   status?: 'active' | 'inactive' | 'maintenance',
 *   created_at?: string,
 *   updated_at?: string
 * }
 * 
 * Client: {
 *   id: number,
 *   codigoalternativo: string,
 *   razonsocial: string,
 *   nombre: string,
 *   direccion: string,
 *   telefono: string,
 *   rut: string,
 *   activo: number,
 *   latitud: number,
 *   longitud: number,
 *   created_at?: string,
 *   updated_at?: string
 * }
 * 
 * DiaEntrega: {
 *   id: number,
 *   descripcion: string,
 *   created_at?: string,
 *   updated_at?: string
 * }
 * 
 * Reparto: {
 *   id: number,
 *   diasEntrega_id: number,
 *   camion_id: number,
 *   dia_descripcion?: string,
 *   camion_descripcion?: string,
 *   created_at?: string,
 *   updated_at?: string
 * }
 * 
 * ClienteporReparto: {
 *   id: number,
 *   reparto_id: number,
 *   cliente_id: number,
 *   dia_descripcion?: string,
 *   camion_descripcion?: string,
 *   cliente_nombre?: string,
 *   cliente_razonsocial?: string,
 *   cliente_direccion?: string,
 *   cliente_telefono?: string,
 *   cliente_rut?: string,
 *   created_at?: string,
 *   updated_at?: string
 * }
 * 
 * ApiResponse: {
 *   success: boolean,
 *   data?: any,
 *   message?: string,
 *   error?: string
 * }
 * 
 * UsersResponse: {
 *   success: boolean,
 *   users: User[],
 *   total: number
 * }
 * 
 * TrucksResponse: {
 *   success: boolean,
 *   trucks: Truck[],
 *   total: number
 * }
 * 
 * ClientsResponse: {
 *   success: boolean,
 *   clients: Client[],
 *   total: number
 * }
 * 
 * DiasEntregaResponse: {
 *   success: boolean,
 *   diasEntrega: DiaEntrega[],
 *   total: number
 * }
 * 
 * RepartosResponse: {
 *   success: boolean,
 *   repartos: Reparto[],
 *   total: number
 * }
 * 
 * ClientesporRepartoResponse: {
 *   success: boolean,
 *   clientesporReparto: ClienteporReparto[],
 *   total: number
 * }
 * 
 * CreateUserData: {
 *   name: string,
 *   email: string,
 *   age: number,
 *   phone?: string,
 *   role?: string
 * }
 * 
 * CreateTruckData: {
 *   description: string,
 *   brand?: string,
 *   model?: string,
 *   year?: number,
 *   license_plate?: string,
 *   capacity?: string,
 *   status?: string
 * }
 * 
 * CreateClientData: {
 *   codigoalternativo?: string,
 *   razonsocial: string,
 *   nombre: string,
 *   direccion: string,
 *   telefono: string,
 *   rut: string,
 *   activo?: number,
 *   latitud?: number,
 *   longitud?: number
 * }
 * 
 * CreateDiaEntregaData: {
 *   descripcion: string
 * }
 * 
 * CreateRepartoData: {
 *   diasEntrega_id: number,
 *   camion_id: number
 * }
 * 
 * CreateClienteporRepartoData: {
 *   reparto_id: number,
 *   cliente_id: number
 * }
 * 
 * HealthStatus: {
 *   status: string,
 *   message: string,
 *   timestamp: string,
 *   version: string,
 *   environment: string
 * }
 */

// Funciones de validación para usuarios
export const validateUser = (user) => {
  return user && 
         typeof user.name === 'string' && user.name.length > 0 &&
         typeof user.email === 'string' && user.email.includes('@') &&
         typeof user.age === 'number' && user.age > 0;
};

export const validateCreateUserData = (data) => {
  return data &&
         typeof data.name === 'string' && data.name.length > 0 &&
         typeof data.email === 'string' && data.email.includes('@') &&
         typeof data.age === 'number' && data.age > 0;
};

// Funciones de validación para camiones
export const validateTruck = (truck) => {
  return truck && 
         typeof truck.description === 'string' && truck.description.length > 0;
};

export const validateCreateTruckData = (data) => {
  return data && 
         typeof data.description === 'string' && 
         data.description.length > 0;
};

// Funciones de validación para clientes
export const validateClient = (client) => {
  return client && 
         typeof client.razonsocial === 'string' && client.razonsocial.length > 0 &&
         typeof client.nombre === 'string' && client.nombre.length > 0 &&
         typeof client.direccion === 'string' && client.direccion.length > 0 &&
         typeof client.telefono === 'string' && client.telefono.length > 0 &&
         typeof client.rut === 'string' && client.rut.length > 0;
};

export const validateCreateClientData = (data) => {
  return data && 
         typeof data.nombre === 'string' && data.nombre.length > 0;
};

// Funciones de validación para días de entrega
export const validateDiaEntrega = (diaEntrega) => {
  return diaEntrega && 
         typeof diaEntrega.descripcion === 'string' && diaEntrega.descripcion.length > 0;
};

export const validateCreateDiaEntregaData = (data) => {
  return data && 
         typeof data.descripcion === 'string' && 
         data.descripcion.length > 0;
};

// Funciones de validación para repartos
export const validateReparto = (reparto) => {
  return reparto && 
         typeof reparto.diasEntrega_id === 'number' && reparto.diasEntrega_id > 0 &&
         typeof reparto.camion_id === 'number' && reparto.camion_id > 0;
};

export const validateCreateRepartoData = (data) => {
  return data && 
         typeof data.diasEntrega_id === 'number' && data.diasEntrega_id > 0 &&
         typeof data.camion_id === 'number' && data.camion_id > 0;
};

// Funciones de validación para clientes por reparto
export const validateClienteporReparto = (clienteporReparto) => {
  return clienteporReparto && 
         typeof clienteporReparto.reparto_id === 'number' && clienteporReparto.reparto_id > 0 &&
         typeof clienteporReparto.cliente_id === 'number' && clienteporReparto.cliente_id > 0;
};

export const validateCreateClienteporRepartoData = (data) => {
  return data && 
         typeof data.reparto_id === 'number' && data.reparto_id > 0 &&
         typeof data.cliente_id === 'number' && data.cliente_id > 0;
};
