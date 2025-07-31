// Central imports configuration
// Este archivo centraliza todas las importaciones comunes para evitar errores de rutas

// Authentication
export { requireAuth } from './lib/apiAuth.js';
export { verifyPassword, generateToken, verifyToken } from './lib/auth.js';

// Types and validators
export { 
  validateCreateClientData,
  validateCreateTruckData,
  validateCreateRepartoData,
  validateCreateClienteporRepartoData,
  validateCreateDiaEntregaData,
  validateCreateUserData
} from './types/index.js';

// API client
export { api } from './lib/api.js';

// Components
export { Logo, LogoSmall, LogoText } from './components/ui/Logo.jsx';
export { default as Navigation } from './components/layout/Navigation.jsx';
export { default as Dashboard } from './components/features/Dashboard.jsx';
