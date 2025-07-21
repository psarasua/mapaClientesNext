/**
 * Estructuras de datos del proyecto
 * 
 * User: {
 *   id: number,
 *   usuario: string,
 *   password: string,
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
export const validateCreateUserData = (data) => {
  return data &&
         typeof data.usuario === 'string' && data.usuario.length >= 3 &&
         typeof data.password === 'string' && data.password.length >= 6;
};

// Funciones de validación para camiones
export const validateCreateTruckData = (data) => {
  return data && 
         typeof data.description === 'string' && 
         data.description.length > 0;
};

// Funciones de validación para clientes
export const validateCreateClientData = (data) => {
  return data && 
         typeof data.nombre === 'string' && data.nombre.length > 0;
};

// Funciones de validación para días de entrega
export const validateCreateDiaEntregaData = (data) => {
  return data && 
         typeof data.descripcion === 'string' && 
         data.descripcion.length > 0;
};

// Funciones de validación para repartos
export const validateCreateRepartoData = (data) => {
  return data && 
         typeof data.diasEntrega_id === 'number' && data.diasEntrega_id > 0 &&
         typeof data.camion_id === 'number' && data.camion_id > 0;
};

// Funciones de validación para clientes por reparto
export const validateCreateClienteporRepartoData = (data) => {
  return data && 
         typeof data.reparto_id === 'number' && data.reparto_id > 0 &&
         typeof data.cliente_id === 'number' && data.cliente_id > 0;
};
