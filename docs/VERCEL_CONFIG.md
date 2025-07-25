# 🚀 Configuración de Vercel - MapaClientes

## 🔧 Variables de Entorno

Configurar en el dashboard de Vercel > Settings > Environment Variables:

```bash
# Base de datos
TURSO_DATABASE_URL=libsql://your-database.turso.tech
TURSO_AUTH_TOKEN=your-turso-token

# Autenticación
JWT_SECRET=your-secure-jwt-secret

# Entorno
NODE_ENV=production
```

## ⚙️ Configuración Automática

El proyecto ya incluye:

### `next.config.mjs`
```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3']
  }
}
```

### Scripts optimizados
```json
{
  "build": "next build",
  "start": "next start", 
  "dev": "next dev --turbopack"
}
```

## 🚀 Despliegue

### Automático (Recomendado)
1. Conectar repositorio GitHub a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push a `main`

### Manual
```bash
npm install -g vercel
vercel --prod
```

## ✅ Verificación Post-Despliegue
- [ ] Login funciona: `admin / admin123`
- [ ] CRUD de usuarios, clientes, camiones
- [ ] Importación de Excel
- [ ] Mapas se cargan correctamente

---
*Actualizado: 25/07/2025*
---
*Actualizado: 25/07/2025*
