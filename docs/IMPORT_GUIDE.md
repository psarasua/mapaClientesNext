# 📁 Guía de Importaciones - MapaClientes

## ❌ **NUNCA Usar Estas Importaciones**
```javascript
// ❌ NO FUNCIONA - Evitar alias @
import { requireAuth } from '@/lib/apiAuth';
import DatabaseAdapter from '@/lib/database/adapter';
import { validateCreateClientData } from '@/types/index';
```

## ✅ **SIEMPRE Usar Rutas Relativas**

### **Para archivos en `/api/xxx/route.js` (nivel 3)**
```javascript
// ✅ CORRECTO - Rutas relativas desde api/xxx/
import { requireAuth } from '../../../lib/apiAuth.js';
import DatabaseAdapter from '../../../lib/database/adapter.js';
import { validateCreateClientData } from '../../../types/index.js';
```

### **Para archivos en `/api/auth/xxx/route.js` (nivel 4)**  
```javascript
// ✅ CORRECTO - Rutas relativas desde api/auth/xxx/
import { requireAuth } from '../../../../lib/apiAuth.js';
import DatabaseAdapter from '../../../../lib/database/adapter.js';
import { verifyPassword, generateToken } from '../../../../lib/auth.js';
```

## 🗂️ **Estructura de Carpetas**
```
src/
├── app/
│   └── api/
│       ├── clients/route.js          (nivel 3: ../../../)
│       ├── trucks/route.js           (nivel 3: ../../../)
│       └── auth/
│           └── login/route.js        (nivel 4: ../../../../)
├── lib/
│   ├── apiAuth.js
│   ├── auth.js
│   └── database/
│       └── adapter.js
└── types/
    └── index.js
```

## 🔧 **Importaciones Comunes por Tipo**

### **Autenticación**
```javascript
import { requireAuth } from '../../../lib/apiAuth.js';
import { verifyPassword, generateToken } from '../../../lib/auth.js';
```

### **Base de Datos**
```javascript
import DatabaseAdapter from '../../../lib/database/adapter.js';
import { getDatabase } from '../../../lib/database/adapter.js';
```

### **Validaciones**
```javascript
import { validateCreateClientData } from '../../../types/index.js';
import { validateCreateTruckData } from '../../../types/index.js';
import { validateCreateRepartoData } from '../../../types/index.js';
```

## 🚫 **Reglas Importantes**

1. **Siempre usar .js extension** en las importaciones
2. **Contar los niveles** de carpeta para determinar `../`
3. **No usar alias @** - causa problemas en Next.js
4. **Mantener consistencia** en todas las rutas

## ⚡ **Si Aparece Error "Module not found"**

1. **Verificar el número de `../`**:
   - Desde `api/xxx/`: usar `../../../`
   - Desde `api/auth/xxx/`: usar `../../../../`

2. **Verificar que el archivo exista**:
   ```bash
   ls src/lib/apiAuth.js
   ls src/types/index.js
   ```

3. **Añadir extensión .js**:
   ```javascript
   // ❌ Sin extensión
   from '../../../lib/apiAuth'
   
   // ✅ Con extensión
   from '../../../lib/apiAuth.js'
   ```

---
*Última actualización: 25/07/2025*
