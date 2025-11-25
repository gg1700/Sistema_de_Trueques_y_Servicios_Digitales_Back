-- Stored Procedure para obtener datos completos del usuario
-- Hace JOIN entre usuario y detalle_usuario para obtener toda la información

CREATE OR REPLACE FUNCTION sp_obtenerdatousuarioscompletos(
    p_handle_name VARCHAR
)
RETURNS TABLE (
    cod_us INT,
    cod_rol INT,
    handle_name VARCHAR,
    nom_us VARCHAR,
    ap_pat_us VARCHAR,
    ap_mat_us VARCHAR,
    correo_us VARCHAR,
    telefono_us VARCHAR,
    ci_us VARCHAR,
    fecha_nac_us DATE,
    genero_us VARCHAR,
    estado_us VARCHAR,
    fecha_registro TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.cod_us,
        u.cod_rol,
        u.handle_name,
        u.nom_us,
        u.ap_pat_us,
        u.ap_mat_us,
        u.correo_us,
        u.telefono_us,
        u.ci AS ci_us,
        u.fecha_nacimiento AS fecha_nac_us,
        u.sexo::VARCHAR AS genero_us,
        u.estado_us::VARCHAR AS estado_us,
        du.fecha_registro
    FROM usuario u
    LEFT JOIN detalle_usuario du ON u.cod_us = du.cod_us
    WHERE u.handle_name = p_handle_name;
END;
$$ LANGUAGE plpgsql;
