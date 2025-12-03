-- ============================================================
-- TRIGGER PARA PUBLICACIONES (Productos y Servicios)
-- Logro #5: Emprendedor Verde (25 publicaciones ecológicas)
-- ============================================================

-- Función para actualizar logro de publicaciones
CREATE OR REPLACE FUNCTION update_publication_achievement()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id INTEGER;
    v_eco_publications_count INTEGER;
    v_progress NUMERIC;
    v_estado TEXT;
BEGIN
    -- Obtener el usuario
    v_user_id := NEW.cod_us;
    
    -- Contar publicaciones ecológicas del usuario
    SELECT COUNT(*) INTO v_eco_publications_count
    FROM publicacion
    WHERE cod_us = v_user_id
      AND impacto_amb_pub > 0
      AND estado_pub = 'activo';
    
    -- Calcular progreso
    v_progress := LEAST((v_eco_publications_count::NUMERIC / 25) * 100, 100);
    v_estado := CASE WHEN v_eco_publications_count >= 25 THEN 'completado' ELSE 'en_progreso' END;
    
    -- Actualizar o insertar el logro
    INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
    VALUES (v_user_id, 5, v_progress, v_estado::\"AchievementState\")
    ON CONFLICT (cod_us, cod_logro) DO UPDATE
    SET progreso = v_progress,
        estado_logro = v_estado::\"AchievementState\",
        fecha_obtencion_logro = CASE 
            WHEN v_eco_publications_count >= 25 AND usuario_logro.estado_logro != 'completado' 
            THEN NOW() 
            ELSE usuario_logro.fecha_obtencion_logro 
        END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS trg_achievement_publication ON publicacion;

-- Crear trigger para publicaciones
CREATE TRIGGER trg_achievement_publication
AFTER INSERT OR UPDATE ON publicacion
FOR EACH ROW
WHEN (NEW.impacto_amb_pub > 0 AND NEW.estado_pub = 'activo')
EXECUTE FUNCTION update_publication_achievement();

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✓ Trigger de publicaciones creado exitosamente';
    RAISE NOTICE '  - Logro #5: Emprendedor Verde (25 publicaciones ecológicas)';
END $$;
