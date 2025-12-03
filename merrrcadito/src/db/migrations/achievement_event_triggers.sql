-- ============================================================
-- TRIGGERS PARA EVENTOS
-- Logro: #6 Guardián del Planeta (10 eventos ambientales)
-- ============================================================

-- Función para actualizar logros de eventos
CREATE OR REPLACE FUNCTION update_event_achievements()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id INTEGER;
    v_events_count INTEGER;
    v_event_type TEXT;
BEGIN
    -- Obtener el usuario que se inscribió
    v_user_id := NEW.cod_us;

    -- Verificar si el evento es ambiental
    SELECT tipo_evento INTO v_event_type
    FROM evento
    WHERE cod_evento = NEW.cod_evento;

    -- Solo contar eventos ambientales/beneficos
    IF v_event_type IN ('benefico', 'ambiental', 'ecologico') THEN
        
        -- Contar eventos ambientales en los que ha participado el usuario
        SELECT COUNT(DISTINCT ie.cod_evento) INTO v_events_count
        FROM inscripcion_evento ie
        JOIN evento e ON ie.cod_evento = e.cod_evento
        WHERE ie.cod_us = v_user_id
          AND e.tipo_evento IN ('benefico', 'ambiental', 'ecologico');

        -- ========================================
        -- LOGRO #6: Guardián del Planeta (10 eventos)
        -- ========================================
        
        INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
        VALUES (v_user_id, 6, LEAST((v_events_count::NUMERIC / 10) * 100, 100),
                CASE WHEN v_events_count >= 10 THEN 'completado'::\"AchievementState\" 
                     ELSE 'en_progreso'::\"AchievementState\" END)
        ON CONFLICT (cod_us, cod_logro) DO UPDATE
        SET progreso = LEAST((v_events_count::NUMERIC / 10) * 100, 100),
            estado_logro = CASE WHEN v_events_count >= 10 THEN 'completado'::\"AchievementState\" 
                               ELSE 'en_progreso'::\"AchievementState\" END,
            fecha_obtencion_logro = CASE WHEN v_events_count >= 10 THEN NOW() 
                                        ELSE usuario_logro.fecha_obtencion_logro END;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para inscripciones a eventos
DROP TRIGGER IF EXISTS trg_achievement_event ON inscripcion_evento;
CREATE TRIGGER trg_achievement_event
AFTER INSERT ON inscripcion_evento
FOR EACH ROW
EXECUTE FUNCTION update_event_achievements();

-- ============================================================
-- Mensaje de confirmación
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '✓ Trigger de eventos creado exitosamente';
    RAISE NOTICE '  - Logro #6: Guardián del Planeta';
END $$;
