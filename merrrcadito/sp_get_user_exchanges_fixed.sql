-- SP corregido basado en el schema real de Prisma
CREATE OR REPLACE FUNCTION sp_obtenerhistorialintercambiosusuario(
    p_cod_us INTEGER
)
RETURNS TABLE (
    cod_inter INTEGER,
    cod_us_2 INTEGER,
    nombre_usuario_2 VARCHAR,
    handle_name_2 VARCHAR,
    cant_prod INTEGER,
    unidad_medida VARCHAR,
    impacto_amb_inter DECIMAL
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.cod_inter,
        i.cod_us_2,
        CONCAT(u2.nom_us, ' ', u2.ap_pat_us, ' ', COALESCE(u2.ap_mat_us, '')) AS nombre_usuario_2,
        u2.handle_name AS handle_name_2,
        i.cant_prod,
        i.unidad_medida,
        i.impacto_amb_inter
    FROM intercambio i
    INNER JOIN usuario u2 ON i.cod_us_2 = u2.cod_us
    WHERE i.cod_us_1 = p_cod_us OR i.cod_us_2 = p_cod_us
    ORDER BY i.cod_inter DESC;
END;
$$;
