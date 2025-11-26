-- Stored Procedure para Explorar Productos
-- Devuelve publicaciones activas + inactivas de emprendedores

CREATE OR REPLACE FUNCTION sp_explorarproductos()
RETURNS TABLE (
    cod_pub INT,
    cod_prod INT,
    cod_us INT,
    nom_prod VARCHAR,
    nom_cat VARCHAR,
    nom_subcat_prod VARCHAR,
    precio_prod DECIMAL,
    foto_pub BYTEA,
    calif_pond_pub DECIMAL,
    estado_pub VARCHAR,
    desc_prod VARCHAR,
    impacto_amb_pub DECIMAL,
    marca_prod VARCHAR,
    calidad_prod VARCHAR,
    cant_prod INT,
    unidad_medida VARCHAR,
    correo_us VARCHAR,
    telefono_us VARCHAR,
    handle_name VARCHAR,
    fecha_ini_pub DATE,
    rol_usuario VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.cod_pub,
        pr.cod_prod,
        u.cod_us,
        pr.nom_prod,
        c.nom_cat,
        sc.nom_subcat_prod,
        pr.precio_prod,
        p.foto_pub,
        p.calif_pond_pub,
        p.estado_pub::VARCHAR,
        pr.desc_prod,
        p.impacto_amb_pub,
        pr.marca_prod,
        pr.calidad_prod::VARCHAR,
        pp.cant_prod,
        pp.unidad_medida,
        u.correo_us,
        u.telefono_us,
        u.handle_name,
        p.fecha_ini_pub,
        r.nom_rol::VARCHAR AS rol_usuario
    FROM publicacion p
    INNER JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
    INNER JOIN producto pr ON pp.cod_prod = pr.cod_prod
    INNER JOIN subcategoria_producto sc ON pr.cod_subcat_prod = sc.cod_subcat_prod
    INNER JOIN categoria c ON sc.cod_cat = c.cod_cat
    INNER JOIN usuario u ON p.cod_us = u.cod_us
    INNER JOIN rol r ON u.cod_rol = r.cod_rol
    WHERE 
        p.estado_pub = 'activo' 
        OR (p.estado_pub = 'inactivo' AND r.nom_rol = 'emprendedor')
    ORDER BY p.fecha_ini_pub DESC;
END;
$$ LANGUAGE plpgsql;
