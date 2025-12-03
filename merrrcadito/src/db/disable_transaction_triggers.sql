-- Script to disable problematic transaction triggers that cause double wallet deductions
-- Run this script to prevent database triggers from auto-updating wallets

-- 1. Disable trigger that applies wallet debits/credits (CAUSES DOUBLE CHARGING)
DROP TRIGGER IF EXISTS after_insert_transaccion_aplicar_saldos ON transaccion;

-- 2. Disable trigger that validates balance before insert (redundant with TypeScript validation)
DROP TRIGGER IF EXISTS before_insert_transaccion_validar_saldo ON transaccion;

-- 3. Disable trigger that verifies transaction modality (will validate in TypeScript)
DROP TRIGGER IF EXISTS before_insert_transaccion_verificar_modalidad ON transaccion;

-- KEEP these triggers (they don't affect wallets):
-- - after_insert_transaccion_registrar_bitacora (audit log)
-- - after_insert_calcular_calificacion_ponderada (ratings)
-- - after_update_progreso_logro (achievements)
-- - etc.

-- After running this script, restart the backend server for changes to take effect
