# 🚀 Instrucciones para Configurar Variables de Entorno en Vercel

## 📋 Pasos para Configurar en Vercel Dashboard:

### 1. **Ir a tu proyecto en Vercel**
   - Ve a https://vercel.com/dashboard
   - Selecciona tu proyecto `mapa-clientes-next`

### 2. **Acceder a Environment Variables**
   - Click en **Settings**
   - Click en **Environment Variables**

### 3. **Agregar cada variable una por una:**

#### Variables CRÍTICAS (sin estas no funciona):

**DATABASE_URL**
- Name: `DATABASE_URL`
- Value: `libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io`
- Environment: `Production`, `Preview`, `Development`

**TURSO_DATABASE_URL**
- Name: `TURSO_DATABASE_URL` 
- Value: `libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io`
- Environment: `Production`, `Preview`, `Development`

**TURSO_AUTH_TOKEN**
- Name: `TURSO_AUTH_TOKEN`
- Value: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM4MTUxNTgsImlkIjoiZWM4YmQxZDMtZjhiNS00ZTA0LTkzZmEtYjYwZmJiMjk2MjFkIiwicmlkIjoiYzZlZTViNWYtMzU2Yy00ZDJjLWE5ODYtN2NlYzJhY2I1N2VhIn0.KOFFQYcqA1x7ctz1Og8F03PwGhLPKiACOFI1CM2Q_knLi8C-Jee45xSVGsr9v7E__eE26woeHR_ayLfzs_QjBQ`
- Environment: `Production`, `Preview`, `Development`

#### Variables de Auth:

**NEXTAUTH_SECRET**
- Name: `NEXTAUTH_SECRET`
- Value: `super-secreto-produccion-cambiar-por-uno-aleatorio-muy-seguro-2025`
- Environment: `Production`, `Preview`, `Development`
- ⚠️ **IMPORTANTE**: Cambia este valor por algo más seguro y aleatorio

**NEXTAUTH_URL**
- Name: `NEXTAUTH_URL`
- Value: `https://mapa-clientes-next.vercel.app`
- Environment: `Production`, `Preview`

#### Variables de Configuración:

**NODE_ENV**
- Name: `NODE_ENV`
- Value: `production`
- Environment: `Production`

**NEXT_PUBLIC_APP_URL**
- Name: `NEXT_PUBLIC_APP_URL`
- Value: `https://mapa-clientes-next.vercel.app`
- Environment: `Production`, `Preview`

### 4. **Después de agregar todas las variables:**
   - Click en **Save**
   - Ve a **Deployments** 
   - Click en **Redeploy** en el último deployment
   - O haz un nuevo push a GitHub para trigger un nuevo deploy

### 5. **Verificar que funciona:**
   - Una vez que el deploy termine, visita: `https://mapa-clientes-next.vercel.app/api/health`
   - Deberías ver `"database": { "status": "ok" }`

## ⚡ **Resumen Rápido - Variables Mínimas:**
```
DATABASE_URL=libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io
TURSO_DATABASE_URL=libsql://mapa-clientes-psarasua.aws-us-east-2.turso.io  
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM4MTUxNTgsImlkIjoiZWM4YmQxZDMtZjhiNS00ZTA0LTkzZmEtYjYwZmJiMjk2MjFkIiwicmlkIjoiYzZlZTViNWYtMzU2Yy00ZDJjLWE5ODYtN2NlYzJhY2I1N2VhIn0.KOFFQYcqA1x7ctz1Og8F03PwGhLPKiACOFI1CM2Q_knLi8C-Jee45xSVGsr9v7E__eE26woeHR_ayLfzs_QjBQ
NEXTAUTH_SECRET=super-secreto-produccion-cambiar-por-uno-aleatorio-muy-seguro-2025
NEXTAUTH_URL=https://mapa-clientes-next.vercel.app
NODE_ENV=production
```

## 🔒 **Seguridad:**
- **NO** subas archivos `.env` a Git
- Cambia `NEXTAUTH_SECRET` por algo más seguro
- Las credenciales de Turso son sensibles, mantenlas privadas
