-- ============================================================
-- SCRIPT MAESTRO PARA APLICAR TODOS LOS TRIGGERS DE LOGROS
-- ============================================================

\echo '============================================================'
\echo 'APLICANDO SISTEMA COMPLETO DE LOGROS AUTOMÁTICOS'
\echo '============================================================'

-- 1. Trigger de notificaciones (CRÍTICO)
\echo ''
\echo '1/4 Aplicando trigger de notificaciones...'
\i src/db/migrations/achievement_notification_trigger.sql

-- 2. Triggers de transacciones
\echo ''
\echo '2/4 Aplicando triggers de transacciones...'
\i src/db/migrations/achievement_transaction_triggers.sql

-- 3. Triggers de eventos
\echo ''
\echo '3/4 Aplicando triggers de eventos...'
\i src/db/migrations/achievement_event_triggers.sql

-- 4. Triggers de publicaciones
\echo ''
\echo '4/4 Aplicando triggers de publicaciones...'
\i src/db/migrations/achievement_publication_triggers.sql

-- Verificación final
\echo ''
\echo '============================================================'
\echo 'VERIFICANDO TRIGGERS INSTALADOS'
\echo '============================================================'

SELECT 
    t.tgname as "Trigger",
    c.relname as "Tabla",
    CASE t.tgenabled 
        WHEN 'O' THEN 'Activo ✓'
        ELSE 'Inactivo ✗'
    END as "Estado"
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname LIKE '%achievement%'
   OR t.tgname LIKE '%logro%'
ORDER BY c.relname, t.tgname;

\echo ''
\echo '============================================================'
\echo '✓ SISTEMA DE LOGROS AUTOMÁTICOS INSTALADO CORRECTAMENTE'
\echo '============================================================'
\echo ''
\echo 'Logros que ahora se actualizan automáticamente:'
\echo '  ✓ #1 Primer Intercambio (intercambios completados)'
\echo '  ✓ #3 Vendedor Estrella (50 ventas)'
\echo '  ✓ #5 Emprendedor Verde (25 publicaciones ecológicas)'
\echo '  ✓ #6 Guardián del Planeta (10 eventos ambientales)'
\echo '  ✓ #7 Cliente Frecuente (30 compras)'
\echo ''
\echo 'Las notificaciones se crearán automáticamente al completar logros.'
\echo '============================================================'
