-- SP para agregar id_token al historial de transacciones
CREATE OR REPLACE FUNCTION sp_obtenerhistorialtransaccionesusuario(
    p_cod_us INTEGER
)
RETURNS TABLE (
    cod_trans INTEGER,
    cod_potenciador INTEGER,
    cod_us_origen INTEGER,
    cod_us_destino INTEGER,
    handle_name_origen VARCHAR,
    handle_name_destino VARCHAR,
    monto_pagado NUMERIC,
    cod_pub INTEGER,
    id_token INTEGER,
    cod_evento INTEGER,
    desc_trans VARCHAR,
    fecha_trans TIMESTAMP,
    moneda VARCHAR,
    monto_regalo NUMERIC,
    estado_trans VARCHAR,
    estado_escrow VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.cod_trans,
        t.cod_potenciador,
        t.cod_us_origen,
        t.cod_us_destino,
        u_origen.handle_name AS handle_name_origen,
        u_destino.handle_name AS handle_name_destino,
        COALESCE(e.monto_pagado, 0.0) AS monto_pagado,
        t.cod_pub,
        t.id_token,
        t.cod_evento,
        t.desc_trans,
        t.fecha_trans,
        t.moneda::VARCHAR,
        t.monto_regalo,
        t.estado_trans::VARCHAR,
        e.estado_escrow::VARCHAR
    FROM transaccion t
    INNER JOIN usuario u_origen ON t.cod_us_origen = u_origen.cod_us
    LEFT JOIN usuario u_destino ON t.cod_us_destino = u_destino.cod_us
    LEFT JOIN escrow e ON t.cod_trans = e.cod_trans
    WHERE t.cod_us_origen = p_cod_us OR t.cod_us_destino = p_cod_us
    ORDER BY t.fecha_trans DESC;
END;
$$;
