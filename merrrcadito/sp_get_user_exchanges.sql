-- Stored Procedure para obtener historial de intercambios de un usuario
CREATE OR REPLACE FUNCTION sp_obtenerhistorialintercambiosusuario(
    p_cod_us INTEGER
)
RETURNS TABLE (
    cod_inter INTEGER,
    fecha_inter TIMESTAMP,
    cod_us_2 INTEGER,
    nombre_usuario_2 VARCHAR,
    handle_name_2 VARCHAR,
    cod_prod_origen INTEGER,
    nombre_prod_origen VARCHAR,
    cod_prod_destino INTEGER,
    nombre_prod_destino VARCHAR,
    cant_prod_origen INTEGER,
    cant_prod_destino INTEGER,
    unidad_medida_origen VARCHAR,
    unidad_medida_destino VARCHAR,
    impacto_amb_inter DECIMAL,
    estado_inter VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.cod_inter,
        ip.fecha_inter,
        CASE 
            WHEN i.cod_us_1 = p_cod_us THEN i.cod_us_2
            ELSE i.cod_us_1
        END AS cod_us_2,
        CASE 
            WHEN i.cod_us_1 = p_cod_us THEN CAST(CONCAT(u2.nom_us, ' ', u2.ap_pat_us, ' ', COALESCE(u2.ap_mat_us, '')) AS VARCHAR)
            ELSE CAST(CONCAT(u1.nom_us, ' ', u1.ap_pat_us, ' ', COALESCE(u1.ap_mat_us, '')) AS VARCHAR)
        END AS nombre_usuario_2,
        CASE 
            WHEN i.cod_us_1 = p_cod_us THEN u2.handle_name
            ELSE u1.handle_name
        END AS handle_name_2,
        ip.cod_prod_origen,
        p_origen.nom_prod AS nombre_prod_origen,
        ip.cod_prod_destino,
        p_destino.nom_prod AS nombre_prod_destino,
        i.cant_prod_origen,
        i.cant_prod_destino,
        i.unidad_medida_origen,
        i.unidad_medida_destino,
        i.impacto_amb_inter,
        ip.estado_inter::VARCHAR
    FROM intercambio i
    INNER JOIN intercambio_producto ip ON i.cod_inter = ip.cod_inter
    INNER JOIN usuario u1 ON i.cod_us_1 = u1.cod_us
    INNER JOIN usuario u2 ON i.cod_us_2 = u2.cod_us
    INNER JOIN producto p_origen ON ip.cod_prod_origen = p_origen.cod_prod
    INNER JOIN producto p_destino ON ip.cod_prod_destino = p_destino.cod_prod
    WHERE i.cod_us_1 = p_cod_us OR i.cod_us_2 = p_cod_us
    ORDER BY ip.fecha_inter DESC;
END;
$$;

