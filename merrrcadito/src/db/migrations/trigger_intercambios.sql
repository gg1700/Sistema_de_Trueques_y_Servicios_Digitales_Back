-- ============================================================
-- TRIGGER MEJORADO PARA INTERCAMBIOS
-- Logro #1: Primer Intercambio (1 intercambio completado)
-- ============================================================

-- Función mejorada para actualizar logro de intercambios
CREATE OR REPLACE FUNCTION update_exchange_achievement()
RETURNS TRIGGER AS $$
DECLARE
    v_user1_exchanges INTEGER;
    v_user2_exchanges INTEGER;
    v_progress1 NUMERIC;
    v_progress2 NUMERIC;
    v_estado1 TEXT;
    v_estado2 TEXT;
BEGIN
    -- Solo procesar cuando el intercambio se completa
    IF NEW.estado_inter = 'completado' THEN
        
        -- ========================================
        -- USUARIO 1 (quien propone)
        -- ========================================
        
        -- Contar intercambios completados del usuario 1
        SELECT COUNT(*) INTO v_user1_exchanges
        FROM intercambio
        WHERE (cod_us_1 = NEW.cod_us_1 OR cod_us_2 = NEW.cod_us_1)
          AND estado_inter = 'completado';
        
        v_progress1 := LEAST((v_user1_exchanges::NUMERIC / 1) * 100, 100);
        v_estado1 := CASE WHEN v_user1_exchanges >= 1 THEN 'completado' ELSE 'en_progreso' END;
        
        -- Actualizar logro para usuario 1
        INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
        VALUES (NEW.cod_us_1, 1, v_progress1, v_estado1::\"AchievementState\")
        ON CONFLICT (cod_us, cod_logro) DO UPDATE
        SET progreso = v_progress1,
            estado_logro = v_estado1::\"AchievementState\",
            fecha_obtencion_logro = CASE 
                WHEN v_user1_exchanges >= 1 AND usuario_logro.estado_logro != 'completado' 
                THEN NOW() 
                ELSE usuario_logro.fecha_obtencion_logro 
            END;
        
        -- ========================================
        -- USUARIO 2 (quien recibe la propuesta)
        -- ========================================
        
        -- Contar intercambios completados del usuario 2
        SELECT COUNT(*) INTO v_user2_exchanges
        FROM intercambio
        WHERE (cod_us_1 = NEW.cod_us_2 OR cod_us_2 = NEW.cod_us_2)
          AND estado_inter = 'completado';
        
        v_progress2 := LEAST((v_user2_exchanges::NUMERIC / 1) * 100, 100);
        v_estado2 := CASE WHEN v_user2_exchanges >= 1 THEN 'completado' ELSE 'en_progreso' END;
        
        -- Actualizar logro para usuario 2
        INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
        VALUES (NEW.cod_us_2, 1, v_progress2, v_estado2::\"AchievementState\")
        ON CONFLICT (cod_us, cod_logro) DO UPDATE
        SET progreso = v_progress2,
            estado_logro = v_estado2::\"AchievementState\",
            fecha_obtencion_logro = CASE 
                WHEN v_user2_exchanges >= 1 AND usuario_logro.estado_logro != 'completado' 
                THEN NOW() 
                ELSE usuario_logro.fecha_obtencion_logro 
            END;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS trg_check_achievement_exchange ON intercambio;

-- Crear trigger mejorado para intercambios
CREATE TRIGGER trg_check_achievement_exchange
AFTER UPDATE ON intercambio
FOR EACH ROW
WHEN (OLD.estado_inter IS DISTINCT FROM NEW.estado_inter AND NEW.estado_inter = 'completado')
EXECUTE FUNCTION update_exchange_achievement();

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✓ Trigger de intercambios actualizado exitosamente';
    RAISE NOTICE '  - Logro #1: Primer Intercambio (1 intercambio completado)';
END $$;
