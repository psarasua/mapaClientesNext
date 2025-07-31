// Sistema de logging configurable
const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  constructor() {
    this.isDev = isDevelopment;
  }

  info(message, ...args) {
    if (this.isDev) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  success(message, ...args) {
    if (this.isDev) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  warning(message, ...args) {
    if (this.isDev) {
      console.log(`⚠️ ${message}`, ...args);
    }
  }

  error(message, ...args) {
    // Los errores siempre se muestran
    console.error(`❌ ${message}`, ...args);
  }

  debug(message, ...args) {
    if (this.isDev) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  // Para middleware y APIs
  api(message, ...args) {
    if (this.isDev) {
      console.log(`🌐 ${message}`, ...args);
    }
  }

  // Para componentes de mapa
  map(message, ...args) {
    if (this.isDev) {
      console.log(`🗺️ ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
export default logger; 