# Configuración de Turso Database

Este proyecto utiliza Turso como base de datos en producción.

## Variables de Entorno Requeridas

```bash
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

## Configuración en Producción

1. **Crear base de datos en Turso:**
   ```bash
   turso db create mapaclientesnext
   ```

2. **Obtener URL de conexión:**
   ```bash
   turso db show mapaclientesnext --url
   ```

3. **Crear token de autenticación:**
   ```bash
   turso db tokens create mapaclientesnext
   ```

## Migración de Datos

Para migrar datos de SQLite local a Turso, usar el script:
```bash
node migrate-to-turso.js
```

## Estructura de Tablas

El adaptador de base de datos crea automáticamente las siguientes tablas:
- `users` - Usuarios del sistema
- `clients` - Clientes
- `trucks` - Camiones
- `repartos` - Repartos
- `dias_entrega` - Días de entrega
- `clientes_reparto` - Relación clientes-reparto

## Notas Importantes

- En desarrollo usa SQLite local (`data/users.db`)
- En producción automáticamente cambia a Turso si están configuradas las variables de entorno
- El adaptador maneja la migración transparente entre ambas bases de datos
