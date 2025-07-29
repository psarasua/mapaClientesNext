@echo off
REM Script de configuración inicial para el proyecto MapaClientesNext
REM Este script ayuda a configurar las variables de entorno necesarias

echo 🚀 Configuración inicial de MapaClientesNext
echo =============================================

REM Verificar si ya existe .env.local
if exist ".env.local" (
    echo ⚠️  Ya existe un archivo .env.local
    set /p overwrite="¿Deseas sobrescribirlo? (y/N): "
    if not "%overwrite%"=="y" if not "%overwrite%"=="Y" (
        echo ❌ Configuración cancelada
        exit /b 1
    )
)

REM Copiar el archivo de ejemplo
echo 📋 Copiando .env.example a .env.local...
copy .env.example .env.local

echo ✅ Archivo .env.local creado
echo.
echo 📝 Pasos siguientes:
echo 1. Edita el archivo .env.local con tus credenciales reales
echo 2. Para Turso:
echo    - Visita https://app.turso.tech/
echo    - Crea tu base de datos
echo    - Obtén la URL: turso db show tu-database --url
echo    - Crea un token: turso db tokens create tu-database
echo 3. Ejecuta: npm run dev
echo.
echo ⚠️  IMPORTANTE: Nunca subas el archivo .env.local a GitHub
echo.
pause
