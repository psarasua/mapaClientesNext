# 🚀 Configuración final de Vercel

## Variables de entorno requeridas en Vercel Dashboard:

### 1. Ve a tu proyecto en Vercel:
https://vercel.com/dashboard

### 2. Selecciona tu proyecto "mapa-clientes"

### 3. Ve a Settings > Environment Variables

### 4. Agrega estas variables:

```
NODE_ENV = production
TURSO_DATABASE_URL = libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN = your-auth-token-here
```

## 🎯 Para obtener las credenciales de Turso:

### Opción A: Sin CLI (Más fácil)
1. Ve a https://app.turso.tech/
2. Crea una cuenta
3. Crea database "mapa-clientes"
4. Copia URL y genera token desde la web

### Opción B: Con CLI
```bash
# Instalar Turso CLI
iwr https://get.tur.so/install.ps1 | iex

# Autenticar
turso auth login

# Crear base de datos
turso db create mapa-clientes

# Obtener URL
turso db show mapa-clientes

# Crear token
turso db tokens create mapa-clientes
```

## 🔄 Después de agregar variables:
1. Redeploy el proyecto en Vercel
2. Tu app detectará automáticamente Turso en producción
3. Las tablas se crearán automáticamente

## 📱 Tu app funcionará con:
- SQLite local para desarrollo
- Turso para producción en Vercel
