-- ============================================================
-- TRIGGERS PARA TRANSACCIONES (Ventas y Compras)
-- Logros: #3 Vendedor Estrella, #7 Cliente Frecuente
-- ============================================================

-- Función para actualizar logros de transacciones
CREATE OR REPLACE FUNCTION update_transaction_achievements()
RETURNS TRIGGER AS $$
DECLARE
    v_seller_id INTEGER;
    v_buyer_id INTEGER;
    v_seller_sales_count INTEGER;
    v_buyer_purchases_count INTEGER;
    v_seller_avg_rating NUMERIC;
BEGIN
    -- Solo procesar transacciones satisfactorias
    IF NEW.estado_trans = 'satisfactorio' THEN
        v_seller_id := NEW.cod_us_destino; -- Vendedor
        v_buyer_id := NEW.cod_us_origen;   -- Comprador

        -- ========================================
        -- LOGRO #3: Vendedor Estrella (50 ventas con rating >4.5)
        -- ========================================
        
        -- Contar ventas del vendedor
        SELECT COUNT(*) INTO v_seller_sales_count
        FROM transaccion
        WHERE cod_us_destino = v_seller_id
          AND estado_trans = 'satisfactorio';

        -- Calcular rating promedio del vendedor (si existe tabla de calificaciones)
        -- Por ahora asumimos rating 5.0 si no hay sistema de calificaciones
        v_seller_avg_rating := 5.0;

        -- Actualizar progreso del logro "Vendedor Estrella"
        IF v_seller_avg_rating >= 4.5 THEN
            INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
            VALUES (v_seller_id, 3, LEAST((v_seller_sales_count::NUMERIC / 50) * 100, 100), 
                    CASE WHEN v_seller_sales_count >= 50 THEN 'completado'::\"AchievementState\" 
                         ELSE 'en_progreso'::\"AchievementState\" END)
            ON CONFLICT (cod_us, cod_logro) DO UPDATE
            SET progreso = LEAST((v_seller_sales_count::NUMERIC / 50) * 100, 100),
                estado_logro = CASE WHEN v_seller_sales_count >= 50 THEN 'completado'::\"AchievementState\" 
                                   ELSE 'en_progreso'::\"AchievementState\" END,
                fecha_obtencion_logro = CASE WHEN v_seller_sales_count >= 50 THEN NOW() 
                                            ELSE usuario_logro.fecha_obtencion_logro END;
        END IF;

        -- ========================================
        -- LOGRO #7: Cliente Frecuente (30 compras)
        -- ========================================
        
        -- Contar compras del comprador
        SELECT COUNT(*) INTO v_buyer_purchases_count
        FROM transaccion
        WHERE cod_us_origen = v_buyer_id
          AND estado_trans = 'satisfactorio';

        -- Actualizar progreso del logro "Cliente Frecuente"
        INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
        VALUES (v_buyer_id, 7, LEAST((v_buyer_purchases_count::NUMERIC / 30) * 100, 100),
                CASE WHEN v_buyer_purchases_count >= 30 THEN 'completado'::\"AchievementState\" 
                     ELSE 'en_progreso'::\"AchievementState\" END)
        ON CONFLICT (cod_us, cod_logro) DO UPDATE
        SET progreso = LEAST((v_buyer_purchases_count::NUMERIC / 30) * 100, 100),
            estado_logro = CASE WHEN v_buyer_purchases_count >= 30 THEN 'completado'::\"AchievementState\" 
                               ELSE 'en_progreso'::\"AchievementState\" END,
            fecha_obtencion_logro = CASE WHEN v_buyer_purchases_count >= 30 THEN NOW() 
                                        ELSE usuario_logro.fecha_obtencion_logro END;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para transacciones
DROP TRIGGER IF EXISTS trg_achievement_transaction ON transaccion;
CREATE TRIGGER trg_achievement_transaction
AFTER INSERT OR UPDATE ON transaccion
FOR EACH ROW
WHEN (NEW.estado_trans = 'satisfactorio')
EXECUTE FUNCTION update_transaction_achievements();

-- ============================================================
-- Mensaje de confirmación
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '✓ Triggers de transacciones creados exitosamente';
    RAISE NOTICE '  - Logro #3: Vendedor Estrella';
    RAISE NOTICE '  - Logro #7: Cliente Frecuente';
END $$;
