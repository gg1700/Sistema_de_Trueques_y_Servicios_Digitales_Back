-- Stored Procedure para Explorar Servicios
-- Devuelve publicaciones activas + inactivas de emprendedores

CREATE OR REPLACE FUNCTION sp_explorarservicios()
RETURNS TABLE (
    cod_pub INT,
    cod_serv INT,
    nom_serv VARCHAR,
    nom_cat VARCHAR,
    precio_pub DECIMAL,
    foto_pub BYTEA,
    calif_pond_pub DECIMAL,
    estado_pub VARCHAR,
    contenido TEXT,
    fecha_ini_pub DATE,
    correo_us VARCHAR,
    telefono_us VARCHAR,
    handle_name VARCHAR,
    hrs_ini_serv TIME,
    hrs_fin_serv TIME,
    duracion INT,
    rol_usuario VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.cod_pub,
        s.cod_serv,
        s.nom_serv,
        c.nom_cat,
        s.precio_serv AS precio_pub,
        p.foto_pub,
        p.calif_pond_pub,
        p.estado_pub::VARCHAR,
        p.contenido,
        p.fecha_ini_pub,
        u.correo_us,
        u.telefono_us,
        u.handle_name,
        ps.hrs_ini_dia_serv::TIME AS hrs_ini_serv,
        ps.hrs_fin_dia_serv::TIME AS hrs_fin_serv,
        s.duracion_serv AS duracion,
        r.nom_rol::VARCHAR AS rol_usuario
    FROM publicacion p
    INNER JOIN publicacion_servicio ps ON p.cod_pub = ps.cod_pub
    INNER JOIN servicio s ON ps.cod_serv = s.cod_serv
    INNER JOIN categoria c ON s.cod_cat = c.cod_cat
    INNER JOIN usuario u ON p.cod_us = u.cod_us
    INNER JOIN rol r ON u.cod_rol = r.cod_rol
    WHERE 
        p.estado_pub = 'activo'
        OR (p.estado_pub = 'inactivo' AND r.nom_rol = 'emprendedor')
    ORDER BY p.fecha_ini_pub DESC;
END;
$$ LANGUAGE plpgsql;
