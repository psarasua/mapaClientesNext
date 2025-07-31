// Configuración de rutas y secciones de la aplicación
export const ROUTES = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  TRUCKS: 'trucks',
  CLIENTS: 'clients',
  DIAS_ENTREGA: 'diasEntrega',
  REPARTOS: 'repartos',
  CLIENTES_POR_REPARTO: 'clientesporreparto',
  CONFIGURACION: 'configuracion'
};

export const SECTION_CONFIG = {
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    icon: '📊',
    description: 'Panel principal de control'
  },
  [ROUTES.USERS]: {
    title: 'Gestión de Usuarios',
    icon: '👥',
    description: 'Administrar usuarios del sistema'
  },
  [ROUTES.TRUCKS]: {
    title: 'Gestión de Camiones',
    icon: '🚛',
    description: 'Administrar flota de camiones'
  },
  [ROUTES.CLIENTS]: {
    title: 'Gestión de Clientes',
    icon: '👥',
    description: 'Administrar base de clientes'
  },
  [ROUTES.DIAS_ENTREGA]: {
    title: 'Días de Entrega',
    icon: '📅',
    description: 'Configurar días de entrega'
  },
  [ROUTES.REPARTOS]: {
    title: 'Gestión de Repartos',
    icon: '📦',
    description: 'Administrar repartos'
  },
  [ROUTES.CLIENTES_POR_REPARTO]: {
    title: 'Asignaciones Cliente-Reparto',
    icon: '🎯',
    description: 'Asignar clientes a repartos'
  },
  [ROUTES.CONFIGURACION]: {
    title: 'Configuración',
    icon: '⚙️',
    description: 'Configuración del sistema'
  }
};

// Navegación principal
export const MAIN_NAVIGATION = [
  ROUTES.DASHBOARD,
  ROUTES.USERS,
  ROUTES.TRUCKS,
  ROUTES.CLIENTS,
  ROUTES.DIAS_ENTREGA,
  ROUTES.REPARTOS,
  ROUTES.CLIENTES_POR_REPARTO,
  ROUTES.CONFIGURACION
];

// Rutas públicas (no requieren autenticación)
export const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/health'
];

// Rutas protegidas (requieren autenticación)
export const PROTECTED_ROUTES = [
  '/',
  '/configuracion',
  '/import',
  '/api/admin',
  '/api/clients',
  '/api/trucks',
  '/api/users',
  '/api/diasEntrega',
  '/api/repartos',
  '/api/clientesporreparto'
]; 