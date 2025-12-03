CREATE OR REPLACE FUNCTION sp_crearpublicacion(
    p_cod_us INTEGER,
    p_foto_pub BYTEA,
    p_estado_pub "PublicationState",
    p_contenido VARCHAR,
    p_cod_prod INTEGER,
    p_cant_prod DECIMAL,
    p_unidad_medida VARCHAR
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_pub INTEGER;
    v_impacto_calculado NUMERIC := 0;
    v_peso_prod NUMERIC;
    v_factor_co2 NUMERIC;
    v_fecha_ini DATE := CURRENT_DATE;
    v_fecha_fin DATE := CURRENT_DATE + INTERVAL '1 month';
BEGIN
    INSERT INTO publicacion (
        cod_us,
        fecha_ini_pub,
        fecha_fin_pub,
        foto_pub,
        estado_pub,
        contenido,
        impacto_amb_pub
    )
    VALUES (
        p_cod_us,
        v_fecha_ini,
        v_fecha_fin,
        p_foto_pub,
        p_estado_pub,
        p_contenido,
        0
    )
    RETURNING cod_pub INTO v_cod_pub;
    
    INSERT INTO publicacion_producto (
        cod_pub,
        cod_prod,
        cant_prod,
        unidad_medida
    )
    VALUES (
        v_cod_pub,
        p_cod_prod,
        p_cant_prod::INTEGER,
        p_unidad_medida
    );
    
    SELECT peso_prod INTO v_peso_prod
    FROM producto
    WHERE cod_prod = p_cod_prod;
    
    IF v_peso_prod IS NULL THEN
        v_peso_prod := 0;
    END IF;
    
    SELECT m.factor_co2 INTO v_factor_co2
    FROM material_producto mp
    INNER JOIN material m ON mp.cod_mat = m.cod_mat
    WHERE mp.cod_prod = p_cod_prod
    LIMIT 1;
    
    IF v_factor_co2 IS NULL THEN
        v_factor_co2 := 0;
    END IF;
    
    v_impacto_calculado := v_peso_prod * p_cant_prod * v_factor_co2;
    
    UPDATE publicacion
    SET impacto_amb_pub = COALESCE(v_impacto_calculado, 0)
    WHERE cod_pub = v_cod_pub;
    
    RETURN v_cod_pub;
END;
$$;
