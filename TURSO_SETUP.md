# 🚀 Configuración de Turso para Producción

## Paso 1: Crear cuenta en Turso
1. Ve a [https://app.turso.tech/](https://app.turso.tech/)
2. Regístrate con GitHub o email
3. Crea una nueva base de datos

## Paso 2: Obtener credenciales
```bash
# En la terminal (después de instalar Turso CLI)
turso auth login
turso db create mapa-clientes
turso db show mapa-clientes
turso db tokens create mapa-clientes
```

## Paso 3: Variables de entorno para Vercel
```env
NODE_ENV=production
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

## Paso 4: Deploy a Vercel
1. Ve a [https://vercel.com/](https://vercel.com/)
2. Conecta tu repositorio GitHub
3. Agrega las variables de entorno en Vercel Dashboard
4. Deploy automático

## Migración de datos
Tu proyecto detectará automáticamente:
- **Local**: Usa SQLite (data/users.db)
- **Producción**: Usa Turso (en la nube)

## Comandos útiles
```bash
# Ver bases de datos
turso db list

# Conectar a la BD
turso db shell mapa-clientes

# Ver tokens
turso db tokens list mapa-clientes
```
