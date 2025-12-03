-- =====================================================
-- Achievement Notification Trigger
-- =====================================================
-- This trigger automatically creates a notification when a user completes an achievement
-- It fires after INSERT or UPDATE on usuario_logro table
-- =====================================================

-- Function to create notification when achievement is completed
CREATE OR REPLACE FUNCTION trg_after_achievement_completed_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_titulo_logro VARCHAR;
BEGIN
    -- Only create notification if the achievement was just completed
    -- Check if state changed to 'completado' or if it's a new insert with 'completado' state
    IF (TG_OP = 'INSERT' AND NEW.estado_logro = 'completado') OR 
       (TG_OP = 'UPDATE' AND OLD.estado_logro IS DISTINCT FROM NEW.estado_logro AND NEW.estado_logro = 'completado') THEN
        
        -- Get the achievement title
        SELECT titulo_logro INTO v_titulo_logro
        FROM logro
        WHERE cod_logro = NEW.cod_logro;
        
        -- Create notification for the user
        INSERT INTO notificacion (
            cod_us,
            tipo_notif,
            cod_ref,
            mensaje,
            leida,
            fecha_creacion
        ) VALUES (
            NEW.cod_us,
            'achievement_unlocked',
            NEW.cod_logro,
            '¡Felicidades! Has desbloqueado el logro: ' || v_titulo_logro,
            false,
            NOW()
        );
        
        RAISE NOTICE 'Notification created for user % - Achievement: %', NEW.cod_us, v_titulo_logro;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS after_achievement_completed_notification ON usuario_logro;

-- Create trigger
CREATE TRIGGER after_achievement_completed_notification
AFTER INSERT OR UPDATE ON usuario_logro
FOR EACH ROW
EXECUTE FUNCTION trg_after_achievement_completed_notification();

-- Add comment to trigger
COMMENT ON TRIGGER after_achievement_completed_notification ON usuario_logro IS 
'Creates a notification when a user completes an achievement (estado_logro = completado)';
