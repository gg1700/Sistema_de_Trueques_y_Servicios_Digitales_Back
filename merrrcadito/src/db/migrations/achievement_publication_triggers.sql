-- ============================================================
-- TRIGGERS PARA PUBLICACIONES
-- Logro: #5 Emprendedor Verde (25 publicaciones ecológicas)
-- ============================================================

-- Función para actualizar logros de publicaciones
CREATE OR REPLACE FUNCTION update_publication_achievements()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id INTEGER;
    v_eco_publications_count INTEGER;
BEGIN
    -- Obtener el usuario que creó la publicación
    v_user_id := NEW.cod_us;

    -- Contar publicaciones ecológicas del usuario
    -- Consideramos ecológicas aquellas con impacto ambiental > 0
    SELECT COUNT(*) INTO v_eco_publications_count
    FROM publicacion
    WHERE cod_us = v_user_id
      AND impacto_amb_pub > 0
      AND estado_pub = 'activo';

    -- ========================================
    -- LOGRO #5: Emprendedor Verde (25 publicaciones)
    -- ========================================
    
    INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
    VALUES (v_user_id, 5, LEAST((v_eco_publications_count::NUMERIC / 25) * 100, 100),
            CASE WHEN v_eco_publications_count >= 25 THEN 'completado'::\"AchievementState\" 
                 ELSE 'en_progreso'::\"AchievementState\" END)
    ON CONFLICT (cod_us, cod_logro) DO UPDATE
    SET progreso = LEAST((v_eco_publications_count::NUMERIC / 25) * 100, 100),
        estado_logro = CASE WHEN v_eco_publications_count >= 25 THEN 'completado'::\"AchievementState\" 
                           ELSE 'en_progreso'::\"AchievementState\" END,
        fecha_obtencion_logro = CASE WHEN v_eco_publications_count >= 25 THEN NOW() 
                                    ELSE usuario_logro.fecha_obtencion_logro END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para publicaciones
DROP TRIGGER IF EXISTS trg_achievement_publication ON publicacion;
CREATE TRIGGER trg_achievement_publication
AFTER INSERT OR UPDATE ON publicacion
FOR EACH ROW
WHEN (NEW.impacto_amb_pub > 0 AND NEW.estado_pub = 'activo')
EXECUTE FUNCTION update_publication_achievements();

-- ============================================================
-- Mensaje de confirmación
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '✓ Trigger de publicaciones creado exitosamente';
    RAISE NOTICE '  - Logro #5: Emprendedor Verde';
END $$;
