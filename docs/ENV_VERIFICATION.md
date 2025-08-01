# 🔍 Verificación de Variables de Entorno

## 📍 Endpoint de Verificación Unificado

### `/api/health` - Health Check Completo ⭐
```bash
# Local
curl http://localhost:3000/api/health

# Producción
curl https://tu-app.vercel.app/api/health
```

**Qué verifica:**
- ✅ **API funcionando**
- ✅ **Base de datos conectada**
- ✅ **Conteo de usuarios y camiones**
- ✅ **Existencia** de cada variable de entorno
- ✅ **Validez** del formato de cada variable
- ✅ **Conectividad** real con Turso
- ✅ **JWT Secret** válido y funcional
- ✅ **Recomendaciones** específicas
- ✅ **Errores** detallados
- ✅ **Información de deployment**

## 🧪 Validaciones Específicas

### DATABASE_URL
- ✅ Formato `libsql://...turso.io`
- ✅ **Conexión real** a Turso
- ✅ Ejecuta query de prueba

### TURSO_AUTH_TOKEN
- ✅ Formato JWT válido (`eyJ...`)
- ✅ Estructura de token correcta
- ✅ Decodificación del payload

### JWT_SECRET
- ✅ Longitud mínima (32 caracteres)
- ✅ **Genera token de prueba** para validar

### NODE_ENV
- ✅ Valores válidos: `development`, `production`, `test`

### URLs
- ✅ Formato de URL válido

## 🚀 Cómo Usar en Producción

1. **Desplegar cambios:**
   ```bash
   git add .
   git commit -m "feat: agregar verificación completa de variables de entorno"
   git push
   ```

2. **Verificar en producción:**
   ```bash
   curl https://tu-app.vercel.app/api/health
   ```

3. **Interpretar resultados:**
   - `status: "ok"` = Todo correcto ✅
   - `status: "warning"` = Algo falta o está mal ⚠️
   - Revisar `recommendations` para saber qué arreglar
   - Revisar `errors` para detalles específicos

## 🎯 Ejemplo de Respuesta

```json
{
  "status": "ok",
  "analysis": {
    "overallStatus": "ready",
    "databaseConnection": "Conectada"
  },
  "environmentVariables": {
    "DATABASE_URL": {
      "configured": true,
      "valid": true,
      "status": "✅ Válida y conectada"
    },
    "JWT_SECRET": {
      "configured": true,
      "valid": true,
      "status": "✅ Secret válido"
    }
  },
  "recommendations": ["✅ Configuración correcta"]
}
```

## 🛠️ Solución de Problemas

Si encuentras errores:

1. **❌ "Base de datos no conecta"**
   - Verificar `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`
   - Comprobar que el token no haya expirado

2. **❌ "JWT Secret inválido"**
   - Usar secret de al menos 32 caracteres
   - Evitar caracteres especiales problemáticos

3. **⚠️ "Variables faltantes"**
   - Agregar en Railway Dashboard → Variables
   - Hacer redeploy después de agregar

4. **🔄 "Cambios no reflejados"**
   - Hacer redeploy en Railway
   - Limpiar caché si es necesario
