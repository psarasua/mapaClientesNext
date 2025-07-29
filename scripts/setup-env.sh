#!/bin/bash

# Script de configuración inicial para el proyecto MapaClientesNext
# Este script ayuda a configurar las variables de entorno necesarias

echo "🚀 Configuración inicial de MapaClientesNext"
echo "============================================="

# Verificar si ya existe .env.local
if [ -f ".env.local" ]; then
    echo "⚠️  Ya existe un archivo .env.local"
    read -p "¿Deseas sobrescribirlo? (y/N): " overwrite
    if [[ $overwrite != "y" && $overwrite != "Y" ]]; then
        echo "❌ Configuración cancelada"
        exit 1
    fi
fi

# Copiar el archivo de ejemplo
echo "📋 Copiando .env.example a .env.local..."
cp .env.example .env.local

echo "✅ Archivo .env.local creado"
echo ""
echo "📝 Pasos siguientes:"
echo "1. Edita el archivo .env.local con tus credenciales reales"
echo "2. Para Turso:"
echo "   - Visita https://app.turso.tech/"
echo "   - Crea tu base de datos"
echo "   - Obtén la URL: turso db show tu-database --url"
echo "   - Crea un token: turso db tokens create tu-database"
echo "3. Ejecuta: npm run dev"
echo ""
echo "⚠️  IMPORTANTE: Nunca subas el archivo .env.local a GitHub"
echo ""
