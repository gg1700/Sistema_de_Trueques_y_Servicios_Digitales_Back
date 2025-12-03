-- Function to check and update achievement progress
CREATE OR REPLACE FUNCTION check_achievement_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_cod_us INTEGER;
    v_achievement_code INTEGER;
    v_current_progress NUMERIC;
    v_target_progress NUMERIC;
    v_achievement_type TEXT;
BEGIN
    -- Determine the user and achievement type based on the table triggering the function
    IF TG_TABLE_NAME = 'intercambio' THEN
        -- For exchanges, we check both users involved
        IF NEW.estado_inter = 'completado' THEN
            -- Check for User 1
            v_cod_us := NEW.cod_us_1;
            -- Example: "First Exchange" (Assume ID 1)
            -- You would need a more dynamic way to map actions to achievement IDs in a real app
            -- For this demo, we'll hardcode a few common ones or look them up by title
            
            -- Logic for "Intercambiador Novato" (1 exchange)
            SELECT cod_logro INTO v_achievement_code FROM logro WHERE titulo_logro = 'Intercambiador Novato';
            IF v_achievement_code IS NOT NULL THEN
                INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro, fecha_obtencion_logro)
                VALUES (v_cod_us, v_achievement_code, 1, 'completado', NOW())
                ON CONFLICT (cod_us, cod_logro) DO UPDATE
                SET progreso = usuario_logro.progreso + 1,
                    estado_logro = CASE WHEN usuario_logro.progreso + 1 >= 1 THEN 'completado'::"AchievementState" ELSE 'en_progreso'::"AchievementState" END;
            END IF;

             -- Check for User 2
            v_cod_us := NEW.cod_us_2;
            IF v_achievement_code IS NOT NULL THEN
                INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro, fecha_obtencion_logro)
                VALUES (v_cod_us, v_achievement_code, 1, 'completado', NOW())
                ON CONFLICT (cod_us, cod_logro) DO UPDATE
                SET progreso = usuario_logro.progreso + 1,
                    estado_logro = CASE WHEN usuario_logro.progreso + 1 >= 1 THEN 'completado'::"AchievementState" ELSE 'en_progreso'::"AchievementState" END;
            END IF;
        END IF;

    ELSIF TG_TABLE_NAME = 'transaccion' THEN
        -- For transactions (sales/purchases)
        IF NEW.estado_trans = 'satisfactorio' THEN
             v_cod_us := NEW.cod_us_origen; -- Buyer
             -- Logic for "Comprador Compulsivo" (Example)
             -- ...
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trg_check_achievement_exchange ON intercambio;
CREATE TRIGGER trg_check_achievement_exchange
AFTER UPDATE ON intercambio
FOR EACH ROW
WHEN (OLD.estado_inter IS DISTINCT FROM NEW.estado_inter AND NEW.estado_inter = 'completado')
EXECUTE FUNCTION check_achievement_progress();

-- Insert some default achievements if they don't exist
INSERT INTO logro (titulo_logro, descr_logro, icono_logro, calidad_logro)
SELECT 'Intercambiador Novato', 'Realiza tu primer intercambio exitoso', '\x', 'bronce'
WHERE NOT EXISTS (SELECT 1 FROM logro WHERE titulo_logro = 'Intercambiador Novato');

INSERT INTO logro (titulo_logro, descr_logro, icono_logro, calidad_logro)
SELECT 'Vendedor Estrella', 'Completa 10 ventas exitosas', '\x', 'plata'
WHERE NOT EXISTS (SELECT 1 FROM logro WHERE titulo_logro = 'Vendedor Estrella');

INSERT INTO logro (titulo_logro, descr_logro, icono_logro, calidad_logro)
SELECT 'Eco-Amigable', 'Publica 5 productos reciclados', '\x', 'oro'
WHERE NOT EXISTS (SELECT 1 FROM logro WHERE titulo_logro = 'Eco-Amigable');
