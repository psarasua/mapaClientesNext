# 🗺️ MapaClientes - Sistema de Gestión de Clientes y Repartos

Una aplicación web fullstack moderna para la gestión de clientes, repartos y rutas de entrega con mapas interactivos.

## 🚀 Características

- **🗺️ Mapas Interactivos**: Visualización de clientes y rutas con OpenLayers
- **👥 Gestión de Clientes**: CRUD completo con geolocalización
- **🚚 Gestión de Repartos**: Organización de rutas de entrega
- **📅 Días de Entrega**: Configuración de horarios de reparto
- **🚛 Gestión de Camiones**: Control de flota vehicular
- **👤 Sistema de Usuarios**: Autenticación JWT con roles
- **📊 Dashboard**: Estadísticas y métricas en tiempo real
- **📱 Responsive**: Diseño adaptativo para móviles y tablets

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, Bootstrap 5
- **Backend**: Next.js API Routes
- **Base de Datos**: SQLite con Turso
- **Mapas**: OpenLayers
- **Autenticación**: JWT con bcryptjs
- **Estilos**: Bootstrap 5 + CSS personalizado

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn
- Cuenta en Turso (para base de datos)

## ⚙️ Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/mapaClientesNext.git
cd mapaClientesNext
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
# JWT Secret (cambiar en producción)
JWT_SECRET=tu-super-secret-jwt-key-cambiar-en-produccion

# Base de datos Turso
TURSO_DATABASE_URL=@libsql://tu-db.turso.io
TURSO_AUTH_TOKEN=tu-auth-token

# Configuración de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

4. **Ejecutar el proyecto**
```bash
npm run dev
```

5. **Acceder a la aplicación**
```
http://localhost:3000
```

## 👤 Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin123

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── globals.css        # Estilos globales
│   └── layout.js          # Layout principal
├── components/            # Componentes React
│   ├── features/          # Componentes de funcionalidad
│   ├── layout/            # Componentes de layout
│   ├── maps/              # Componentes de mapas
│   └── ui/                # Componentes de UI
├── config/                # Configuraciones
├── contexts/              # Contextos React
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y servicios
│   └── services/          # Servicios de base de datos
└── styles/                # Estilos adicionales
```

## 🗄️ Base de Datos

### Tablas Principales

- **users**: Usuarios del sistema
- **clients**: Clientes con geolocalización
- **repartos**: Rutas de reparto
- **trucks**: Flota vehicular
- **diasEntrega**: Horarios de entrega
- **clientesporReparto**: Relación clientes-repartos

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción

# Linting
npm run lint         # Verificar código
npm run lint:fix     # Corregir errores automáticamente

# Validación
npm run validate     # Validar configuración
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Otros Proveedores

- **Netlify**: Configurar build command `npm run build`
- **Railway**: Despliegue directo desde GitHub
- **Heroku**: Configurar Procfile

## 🔒 Seguridad

- Autenticación JWT
- Validación de roles
- Middleware de protección de rutas
- Variables de entorno seguras
- Sanitización de datos

## 📊 Funcionalidades

### Dashboard
- Estadísticas en tiempo real
- Gráficos de rendimiento
- Resumen de actividades

### Gestión de Clientes
- CRUD completo
- Geolocalización automática
- Búsqueda y filtros
- Exportación de datos

### Mapas Interactivos
- Visualización de clientes
- Rutas de reparto
- Selección de ubicaciones
- Zoom y navegación

### Repartos
- Creación de rutas
- Asignación de clientes
- Optimización de recorridos
- Seguimiento en tiempo real

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/mapaClientesNext/issues)
- **Email**: soporte@mapaclientes.com
- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/mapaClientesNext/wiki)

## 🙏 Agradecimientos

- Next.js por el framework
- OpenLayers por los mapas
- Bootstrap por el diseño
- Turso por la base de datos

---

**Desarrollado con ❤️ para optimizar la gestión de clientes y repartos**
