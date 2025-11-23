-- Stored Procedure para obtener datos de la billetera de un usuario
CREATE OR REPLACE FUNCTION sp_obtenerdatosbilleterausuario(
    p_cod_us INTEGER
)
RETURNS TABLE (
    cod_bill INTEGER,
    cod_us INTEGER,
    cuenta_bancaria VARCHAR,
    saldo_actual DECIMAL,
    saldo_creditos DECIMAL,
    fecha_ultima_trans TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.cod_bill,
        b.cod_us,
        b.cuenta_bancaria,
        b.saldo_actual,
        COALESCE(du.cant_hrs_libres::DECIMAL, 0.0) AS saldo_creditos,
        (
            SELECT MAX(t.fecha_trans) 
            FROM transaccion t 
            WHERE t.cod_us_origen = p_cod_us OR t.cod_us_destino = p_cod_us
        ) AS fecha_ultima_trans
    FROM billetera b
    LEFT JOIN detalle_usuario du ON b.cod_us = du.cod_us
    WHERE b.cod_us = p_cod_us;
END;
$$ LANGUAGE plpgsql;
