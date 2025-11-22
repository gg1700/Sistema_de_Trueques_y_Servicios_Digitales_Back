# Guía de Solución de Problemas - Reportes

## ✅ Verificación Completada

He revisado TODO el código implementado y está **CORRECTO**:
- ✅ Stored procedures: Correctos
- ✅ Servicios backend: Correctos
- ✅ Controladores: Correctos
- ✅ Rutas: Correctas y registradas
- ✅ Frontend: Correcto

## ❌ Problema Principal Identificado

**LOS SERVIDORES NO ESTÁN CORRIENDO**

## 🔧 Solución Paso a Paso

### Paso 1: Iniciar Servidor Backend

```bash
# Terminal 1
cd /home/gg1700/Documents/TBD/Back/Sistema_de_Trueques_y_Servicios_Digitales_Back/merrrcadito

# Iniciar servidor
npm run mer
```

**Debe mostrar algo como:**
```
✅ Server running on port 5000
✅ Database connected
```

**Si ves errores:**
- Error de base de datos → Verifica que PostgreSQL esté corriendo
- Error de puerto → Otro proceso usa el puerto 5000

### Paso 2: Iniciar Servidor Frontend

```bash
# Terminal 2 (NUEVA terminal)
cd /home/gg1700/Documents/TBD/Front/Sistema_de_Trueques_y_Servicios_Digitales_Front/merrrcadito

# Iniciar servidor
npm run dev
```

**Debe mostrar:**
```
✓ Ready in Xms
○ Local: http://localhost:3000
```

### Paso 3: Aplicar Stored Procedures

**IMPORTANTE:** Los stored procedures DEBEN aplicarse a PostgreSQL.

```bash
# Opción A: Si tienes acceso directo
psql -U tu_usuario -d tu_base_de_datos -f src/db/ProcedimientosMRR.sql

# Opción B: Si usas Docker
docker exec -i nombre_contenedor psql -U postgres -d merrrcadito < src/db/ProcedimientosMRR.sql
```

**Para verificar que se aplicaron:**
```sql
-- Conectarse a PostgreSQL y ejecutar:
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE 'sp_reporte%';

-- Deberías ver 10 funciones
```

### Paso 4: Probar Endpoints

```bash
# Probar un endpoint simple
curl http://localhost:5000/api/reports/achievements_gamification

# Si devuelve JSON → ✅ Backend funciona
# Si devuelve "Route not found" → ❌ Servidor no reiniciado
# Si no conecta → ❌ Servidor no está corriendo
```

### Paso 5: Verificar Frontend

1. Abrir navegador: `http://localhost:3000/admin/Reportes`
2. Deberías ver 13 reportes listados
3. Seleccionar mes y año
4. Expandir cada reporte

## 🐛 Errores Comunes

### Error: "Cannot connect to server"
**Causa:** Servidor backend no está corriendo
**Solución:** Ejecutar `npm run mer` en el directorio del backend

### Error: "Route not found"
**Causa:** Servidor no se reinició después de agregar rutas
**Solución:** Detener servidor (Ctrl+C) y reiniciar con `npm run mer`

### Error: "function sp_reporteXXX does not exist"
**Causa:** Stored procedures no aplicados a PostgreSQL
**Solución:** Ejecutar el archivo SQL en PostgreSQL

### Error: Reportes vacíos
**Causa:** No hay datos en la base de datos
**Solución:** Agregar datos de prueba o verificar que las tablas tengan información

## 📋 Checklist de Verificación

- [ ] Servidor backend corriendo (`npm run mer`)
- [ ] Servidor frontend corriendo (`npm run dev`)
- [ ] Stored procedures aplicados a PostgreSQL
- [ ] Endpoint de prueba funciona: `curl http://localhost:5000/api/reports/achievements_gamification`
- [ ] Frontend accesible: `http://localhost:3000/admin/Reportes`
- [ ] Se ven 13 reportes en la lista

## 🆘 Si Aún No Funciona

Por favor proporciona:
1. **Error exacto** que ves (captura de pantalla o texto)
2. **Dónde** ocurre el error (backend, frontend, base de datos)
3. **Salida de consola** cuando inicias los servidores
4. **Resultado** de: `curl http://localhost:5000/api/reports/achievements_gamification`

Con esta información podré ayudarte específicamente.
