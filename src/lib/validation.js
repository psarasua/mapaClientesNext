// Validación de esquemas para datos de entrada
export const validationSchemas = {
  user: {
    usuario: (value) => {
      if (!value || typeof value !== 'string') return 'Usuario es requerido';
      if (value.length < 3) return 'Usuario debe tener al menos 3 caracteres';
      if (value.length > 50) return 'Usuario no puede exceder 50 caracteres';
      return null;
    },
    password: (value) => {
      if (!value || typeof value !== 'string') return 'Contraseña es requerida';
      if (value.length < 6) return 'Contraseña debe tener al menos 6 caracteres';
      return null;
    }
  },

  truck: {
    description: (value) => {
      if (!value || typeof value !== 'string') return 'Descripción es requerida';
      if (value.length > 200) return 'Descripción no puede exceder 200 caracteres';
      return null;
    },
    license_plate: (value) => {
      if (!value || typeof value !== 'string') return 'Patente es requerida';
      if (value.length > 20) return 'Patente no puede exceder 20 caracteres';
      return null;
    },
    brand: (value) => {
      if (!value || typeof value !== 'string') return 'Marca es requerida';
      return null;
    },
    model: (value) => {
      if (!value || typeof value !== 'string') return 'Modelo es requerido';
      return null;
    },
    year: (value) => {
      if (!value) return 'Año es requerido';
      const year = parseInt(value);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        return 'Año debe ser válido';
      }
      return null;
    },
    capacity: (value) => {
      if (!value) return 'Capacidad es requerida';
      const capacity = parseFloat(value);
      if (isNaN(capacity) || capacity <= 0) {
        return 'Capacidad debe ser un número positivo';
      }
      return null;
    }
  },

  client: {
    nombre: (value) => {
      if (!value || typeof value !== 'string') return 'Nombre es requerido';
      if (value.length > 100) return 'Nombre no puede exceder 100 caracteres';
      return null;
    },
    direccion: (value) => {
      if (!value || typeof value !== 'string') return 'Dirección es requerida';
      if (value.length > 200) return 'Dirección no puede exceder 200 caracteres';
      return null;
    },
    telefono: (value) => {
      if (!value || typeof value !== 'string') return 'Teléfono es requerido';
      if (value.length > 20) return 'Teléfono no puede exceder 20 caracteres';
      return null;
    },
    latitud: (value) => {
      if (value !== null && value !== undefined) {
        const lat = parseFloat(value);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          return 'Latitud debe ser un número entre -90 y 90';
        }
      }
      return null;
    },
    longitud: (value) => {
      if (value !== null && value !== undefined) {
        const lng = parseFloat(value);
        if (isNaN(lng) || lng < -180 || lng > 180) {
          return 'Longitud debe ser un número entre -180 y 180';
        }
      }
      return null;
    }
  },

  reparto: {
    nombre: (value) => {
      if (!value || typeof value !== 'string') return 'Nombre es requerido';
      if (value.length > 100) return 'Nombre no puede exceder 100 caracteres';
      return null;
    },
    descripcion: (value) => {
      if (value && typeof value === 'string' && value.length > 500) {
        return 'Descripción no puede exceder 500 caracteres';
      }
      return null;
    }
  },

  diaEntrega: {
    nombre: (value) => {
      if (!value || typeof value !== 'string') return 'Nombre es requerido';
      if (value.length > 50) return 'Nombre no puede exceder 50 caracteres';
      return null;
    },
    descripcion: (value) => {
      if (value && typeof value === 'string' && value.length > 200) {
        return 'Descripción no puede exceder 200 caracteres';
      }
      return null;
    }
  }
};

// Función para validar un objeto completo
export function validateObject(data, schema) {
  const errors = {};
  
  for (const [field, validator] of Object.entries(schema)) {
    const error = validator(data[field]);
    if (error) {
      errors[field] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Función para validar un campo específico
export function validateField(value, fieldName, schema) {
  const validator = schema[fieldName];
  if (!validator) {
    return { isValid: true, error: null };
  }
  
  const error = validator(value);
  return {
    isValid: !error,
    error
  };
} 