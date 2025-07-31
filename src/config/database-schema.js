// src/config/database-schema.js
// Este archivo se genera automáticamente para evitar errores de nombres de columnas

export const databaseSchema = {
  "ClientesporReparto": [
    "id",
    "reparto_id",
    "cliente_id",
    "created_at",
    "updated_at"
  ],
  "clients": [
    "id",
    "codigoalternativo",
    "razonsocial",
    "nombre",
    "direccion",
    "telefono",
    "rut",
    "activo",
    "latitud",
    "longitud",
    "created_at",
    "updated_at"
  ],
  "diasEntrega": [
    "id",
    "descripcion",
    "created_at",
    "updated_at"
  ],
  "repartos": [
    "id",
    "diasEntrega_id",
    "camion_id",
    "created_at",
    "updated_at"
  ],
  "trucks": [
    "id",
    "description",
    "brand",
    "model",
    "year",
    "license_plate",
    "capacity",
    "status",
    "created_at",
    "updated_at"
  ],
  "users": [
    "id",
    "usuario",
    "password",
    "created_at",
    "updated_at"
  ]
};

// Función helper para validar nombres de columnas
export function validateColumn(tableName, columnName) {
  const tableColumns = databaseSchema[tableName];
  if (!tableColumns) {
    throw new Error(`Tabla "${tableName}" no encontrada`);
  }
  
  if (!tableColumns.includes(columnName)) {
    throw new Error(`Columna "${columnName}" no existe en la tabla "${tableName}". Columnas disponibles: ${tableColumns.join(', ')}`);
  }
  
  return true;
}

// Función helper para obtener columnas de una tabla
export function getTableColumns(tableName) {
  return databaseSchema[tableName] || [];
}

// Función helper para verificar si una columna existe
export function columnExists(tableName, columnName) {
  const columns = getTableColumns(tableName);
  return columns.includes(columnName);
}
