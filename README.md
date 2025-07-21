# 🚚 MapaClientesNext - Sistema de Gestión Logística

Sistema completo de gestión logística desarrollado con **Next.js 15**, **React 19**, **SQLite** y **Bootstrap 5**. Permite administrar flotas de camiones, clientes, rutas de entrega y asignación de clientes por reparto con interfaz moderna y responsive.

## 🎯 **Características Principales**

- ✅ **Gestión Completa**: Usuarios, Camiones, Clientes, Días de Entrega y Repartos
- ✅ **Asignación Inteligente**: Sistema de asignación de clientes por reparto
- ✅ **Vista Dual**: Tabla detallada y vista agrupada por camión/día
- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar en todas las entidades
- ✅ **Base de Datos SQLite**: Persistencia local con relaciones complejas
- ✅ **Interfaz Moderna**: Design responsive con Bootstrap 5
- ✅ **APIs RESTful**: Endpoints completos con validación
- ✅ **Datos de Ejemplo**: Sistema precargado con datos realistas

## 🏗️ **Arquitectura del Sistema**

### **Frontend**
- **Next.js 15** con App Router y Turbopack
- **React 19** con hooks y componentes funcionales
- **Bootstrap 5** para diseño responsive
- **6 Módulos principales** con navegación por pestañas

### **Backend**
- **Next.js API Routes** como servidor Node.js
- **SQLite** con better-sqlite3 para base de datos
- **Validación de datos** con sistema de tipos robusto
- **Manejo de errores** comprehensive

### **Base de Datos**
```sql
Usuarios (5) → Camiones (5) → Clientes (10) 
    ↓             ↓              ↓
DiasEntrega (5) → Repartos (25) → ClientesporReparto (76)
```

## 🚀 **Instalación Rápida**

### **1. Clonar el repositorio**
```bash
git clone https://github.com/psarasua/mapaClientesNext.git
cd mapaClientesNext
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Iniciar el servidor**
```bash
npm run dev
```

### **4. Abrir en el navegador**
```
http://localhost:3000
```

> 💡 **Nota**: Si el puerto 3000 está ocupado, Next.js automáticamente usará el siguiente disponible (3001, 3002, etc.)

## 📊 **Módulos del Sistema**

### **1. 👥 Usuarios**
- Gestión de personal de la empresa
- CRUD completo con validaciones
- Campos: nombre, email, teléfono, cargo

### **2. 🚚 Camiones**
- Administración de flota vehicular
- Control de patentes y descripciones
- Estados y disponibilidad

### **3. 🏢 Clientes**
- Base de datos de clientes
- Información completa: razón social, dirección, RUT
- Códigos alternativos y contactos

### **4. 📅 Días de Entrega**
- Configuración de días laborables
- Horarios y rutas específicas
- Planificación semanal

### **5. 🚛 Repartos**
- Combinación día + camión
- 25 repartos automáticos (5 días × 5 camiones)
- Vista matriz para planificación

### **6. 👨‍💼 Clientes por Reparto** ⭐
- **Funcionalidad Principal**: Asignación de clientes a repartos
- **Vista Agrupada**: Organizada por camión y día
- **Vista Tabla**: Lista detallada con filtros
- **Gestión Completa**: Agregar/quitar clientes fácilmente

## 🎮 **Cómo Usar el Sistema**

### **Navegación Principal**
1. **Pestañas superiores**: Cambia entre los 6 módulos
2. **Botones de acción**: Crear, editar, eliminar registros
3. **Filtros**: Buscar por criterios específicos
4. **Vistas alternativas**: Tabla vs. vista agrupada

### **Gestión de Clientes por Reparto**
1. Ve a la pestaña **"Clientes por Reparto"**
2. **Vista Agrupada**: Ver clientes por camión/día
3. **Agregar**: Botón "Agregar Asignación" → seleccionar reparto + cliente
4. **Eliminar**: Botón 🗑️ junto a cada cliente
5. **Filtrar**: Por reparto específico o cliente específico

### **Flujo de Trabajo Típico**
1. **Configurar usuarios** y camiones disponibles
2. **Registrar clientes** con información completa
3. **Configurar días de entrega** operativos
4. **Los repartos se generan automáticamente** (día × camión)
5. **Asignar clientes** a cada reparto según rutas
6. **Visualizar planificación** en vista agrupada

## 📁 **Estructura del Proyecto**

```
📁 mapaClientesNext/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 api/                 # Endpoints REST
│   │   │   ├── 📁 users/          # CRUD usuarios
│   │   │   ├── 📁 trucks/         # CRUD camiones
│   │   │   ├── 📁 clients/        # CRUD clientes
│   │   │   ├── 📁 diasEntrega/    # CRUD días entrega
│   │   │   ├── 📁 repartos/       # CRUD repartos
│   │   │   ├── 📁 clientesporreparto/ # CRUD asignaciones
│   │   │   └── 📁 health/         # Health check
│   │   ├── layout.js              # Layout principal
│   │   └── page.js                # Página principal
│   ├── 📁 components/
│   │   ├── UserList.jsx           # Gestión usuarios
│   │   ├── TruckList.jsx          # Gestión camiones
│   │   ├── ClientList.jsx         # Gestión clientes
│   │   ├── DiaEntregaList.jsx     # Gestión días
│   │   ├── RepartoList.jsx        # Gestión repartos
│   │   ├── ClientesporRepartoList.jsx # ⭐ Asignaciones
│   │   └── ApiStatus.jsx          # Estado del sistema
│   ├── 📁 lib/
│   │   ├── 📁 database/
│   │   │   └── sqlite.js          # Motor de base de datos
│   │   └── api.js                 # Cliente API
│   └── 📁 types/
│       └── index.js               # Validaciones y tipos
├── 📁 data/
│   └── users.db                   # Base de datos SQLite
├── 📁 .github/
│   └── copilot-instructions.md    # Instrucciones desarrollo
└── 📄 Archivos configuración (package.json, next.config.js, etc.)
```

## 🛠️ **APIs Disponibles**

### **Endpoints REST**
```
GET/POST/PUT/DELETE /api/users              # Usuarios
GET/POST/PUT/DELETE /api/trucks             # Camiones  
GET/POST/PUT/DELETE /api/clients            # Clientes
GET/POST/PUT/DELETE /api/diasEntrega        # Días entrega
GET/POST/PUT/DELETE /api/repartos           # Repartos
GET/POST/PUT/DELETE /api/clientesporreparto # Asignaciones
GET                 /api/health             # Estado sistema
```

### **Filtros Especiales**
```
GET /api/clientesporreparto?reparto=1       # Por reparto
GET /api/clientesporreparto?cliente=5       # Por cliente
GET /api/repartos?dia=1&camion=2           # Por día y camión
```

## 💾 **Base de Datos**

### **Tablas y Relaciones**
- **Users**: Gestión de personal
- **Trucks**: Flota de vehículos  
- **Clients**: Base de clientes
- **DiasEntrega**: Días operativos
- **Repartos**: día_id + camion_id (25 combinaciones)
- **ClientesporReparto**: reparto_id + cliente_id (76 asignaciones)

### **Datos de Ejemplo Incluidos**
- 5 usuarios con diferentes cargos
- 5 camiones con patentes realistas
- 10 clientes con datos completos
- 5 días de entrega (Lunes a Viernes)
- 25 repartos automáticos
- 76 asignaciones de clientes distribuidas aleatoriamente

## 🔧 **Comandos Disponibles**

```bash
npm run dev          # Servidor desarrollo (puerto 3000)
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # Linting código
```

## 🌟 **Características Técnicas**

### **Tecnologías**
- **Next.js 15.4.2** con Turbopack
- **React 19** con Concurrent Features
- **SQLite** con better-sqlite3
- **Bootstrap 5.3** para UI
- **JavaScript ES6+** con modules

### **Funcionalidades Avanzadas**
- **Relaciones complejas** entre entidades
- **Validación robusta** de datos
- **Manejo de errores** comprehensive  
- **Interfaz responsive** mobile-first
- **Carga automática** de datos ejemplo
- **APIs con filtros** y búsquedas
- **Estado persistente** con SQLite

## 📝 **Desarrollo y Contribución**

### **Estructura de Commits**
```bash
git add .
git commit -m "feat: descripción de nueva funcionalidad"
git push origin main
```

### **Extensiones Recomendadas**
- ES7+ React/Redux/React-Native snippets
- Better SQLite3 VSCode
- Bootstrap 5 & Font Awesome snippets

## 🎯 **Casos de Uso**

### **Empresas de Logística**
- Planificación de rutas diarias
- Asignación eficiente de clientes
- Control de flota vehicular
- Seguimiento de entregas

### **Distribuidoras**
- Gestión de clientes por zona
- Optimización de repartos
- Control de días operativos
- Administración de recursos

### **Pequeñas y Medianas Empresas**
- Sistema completo sin costos de licencia
- Fácil implementación local
- Datos seguros en SQLite
- Interface intuitiva

## 📞 **Soporte**

- **Repositorio**: https://github.com/psarasua/mapaClientesNext
- **Issues**: Reportar bugs y solicitar features
- **Documentación**: README.md actualizado
- **Código**: Completamente comentado

---

## 🏆 **¡Sistema Listo para Producción!**

El proyecto incluye **todo lo necesario** para un sistema de gestión logística completo:
- ✅ Base de datos funcional con datos ejemplo
- ✅ APIs REST completas y documentadas  
- ✅ Interface moderna y responsive
- ✅ CRUD completo en todas las entidades
- ✅ Sistema de asignaciones avanzado
- ✅ Validaciones y manejo de errores
- ✅ Documentación completa

**¡Simplemente instala y ejecuta!** 🚀
