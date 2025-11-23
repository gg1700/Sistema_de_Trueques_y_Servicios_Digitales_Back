-- Stored Procedure CORREGIDO para incluir id_token en el historial de transacciones
CREATE OR REPLACE FUNCTION sp_obtenerhistorialtransaccionesusuario(
    p_cod_us INTEGER
)
RETURNS TABLE (
    cod_trans INTEGER,
    cod_us_origen INTEGER,
    cod_us_destino INTEGER,
    handle_name_origen VARCHAR,
    handle_name_destino VARCHAR,
    monto_pagado DECIMAL,
    cod_pub INTEGER,
    id_token INTEGER,
    cod_evento INTEGER,
    desc_trans VARCHAR,
    fecha_trans TIMESTAMP,
    moneda VARCHAR,
    estado_trans VARCHAR,
    estado_escrow VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.cod_trans,
        t.cod_us_origen,
        t.cod_us_destino,
        u_origen.handle_name AS handle_name_origen,
        u_destino.handle_name AS handle_name_destino,
        t.monto_pago AS monto_pagado,
        t.cod_pub,
        t.id_token,
        t.cod_evento,
        t.desc_trans,
        t.fecha_trans,
        t.moneda,
        t.estado_trans::VARCHAR,
        t.estado_escrow::VARCHAR
    FROM transaccion t
    LEFT JOIN usuario u_origen ON t.cod_us_origen = u_origen.cod_us
    LEFT JOIN usuario u_destino ON t.cod_us_destino = u_destino.cod_us
    WHERE t.cod_us_origen = p_cod_us OR t.cod_us_destino = p_cod_us
    ORDER BY t.fecha_trans DESC;
END;
$$ LANGUAGE plpgsql;
