# Configuración de Vercel para MapaClientes

## Variables de Entorno en Vercel

Configurar las siguientes variables en el dashboard de Vercel:

### Base de Datos (Turso)
```
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Autenticación JWT
```
JWT_SECRET=your-super-secret-jwt-key-here
```

### Configuración de Node.js
```
NODE_ENV=production
```

## Configuración de Build

El proyecto ya está configurado para Vercel:

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3']
  }
}

module.exports = nextConfig
```

### `vercel.json` (opcional)
```json
{
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  }
}
```

## Scripts de Build
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev --turbopack"
  }
}
```

## Configuración Estática (Azure)

Si se despliega en Azure Static Web Apps, usar:

### `public/staticwebapp.config.json`
```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "mimeTypes": {
    ".json": "application/json"
  }
}
```

## Notas de Despliegue

1. **Turso** se conecta automáticamente en producción
2. **SQLite** se usa solo en desarrollo local
3. Las **API Routes** funcionan como serverless functions
4. **Bootstrap CSS** se carga desde CDN en producción
5. **Middleware** protege rutas automáticamente

## Comandos de Despliegue

### Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Desde GitHub
- Conectar repositorio a Vercel
- Las variables de entorno se configuran en el dashboard
- El despliegue es automático con cada push a main
