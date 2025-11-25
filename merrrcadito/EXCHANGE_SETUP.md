# Instrucciones para Completar la Implementación de Intercambios

## Backend - Pasos Pendientes

### 1. Ejecutar Migración SQL
Ejecuta el archivo `src/db/migrations/add_exchange_fields.sql` en tu base de datos PostgreSQL para añadir los campos necesarios:

```bash
psql -U tu_usuario -d tu_base_de_datos -f src/db/migrations/add_exchange_fields.sql
```

### 2. Registrar Rutas de Intercambios

Edita manualmente el archivo `src/config/server.routes.ts`:

**Añadir import (línea 21, después de ServiceRoutes):**
```typescript
import ExchangeRoutes from '../modules/routes/exchange.routes';
```

**Añadir ruta (línea 43, después de ServiceRoutes):**
```typescript
router.use('/api/exchanges', ExchangeRoutes);
```

### 3. Verificar Conexión a Base de Datos

El controlador de intercambios usa `pool` de `../../db/connection`. Verifica que este archivo exista o ajusta la ruta de importación en `exchange.controller.ts` línea 2.

## Frontend - Archivos Creados

Los siguientes archivos ya están listos para usar:
- ✅ `ExchangeRegistrationForm.tsx` - Formulario completo
- ✅ `ExchangeRegistrationForm.module.css` - Estilos
- ✅ UserProfile actualizado con tab de intercambios

## Probar la Implementación

1. Reinicia el servidor backend
2. Navega al perfil de usuario
3. Ve a la pestaña "Publicar"
4. Selecciona "Intercambio"
5. Prueba crear un intercambio

## Endpoints Disponibles

- `POST /api/exchanges/create` - Crear intercambio
- `GET /api/exchanges/user/:userId` - Obtener intercambios del usuario
- `GET /api/exchanges/:exchangeId` - Detalles del intercambio
- `PATCH /api/exchanges/:exchangeId/status` - Aprobar/rechazar intercambio
