-- verUsuario
CREATE OR REPLACE FUNCTION sp_getusuario(p_id_us INTEGER)
RETURNS TABLE (
    id_us INTEGER,
    handle_name VARCHAR,
    nom_us VARCHAR,
    ap_pat_us VARCHAR,
    ap_mat_us VARCHAR,
    fecha_nacimiento DATE,
    sexo VARCHAR,
    correo_us VARCHAR,
    telefono_us VARCHAR,
    foto_us VARCHAR,
    cod_ubi INTEGER
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_us,
        u.handle_name,
        u.nom_us,
        u.ap_pat_us,
        u.ap_mat_us,
        u.fecha_nacimiento,
        u.sexo,
        u.correo_us,
        u.telefono_us,
        u.foto_us,
        ub.cod_ubi
    FROM USUARIO u
    INNER JOIN UBICACION ub ON u.cod_ubi = ub.cod_ubi
    WHERE u.id_us = p_id_us;
END;
$$ LANGUAGE plpgsql;


--ver logros(ganados y no ganados) de usuario
-- verLogros de un usuario
CREATE OR REPLACE FUNCTION sp_getlogrosusuario(p_id_us INTEGER)
RETURNS TABLE (
    cod_logro INTEGER,
    titulo_logro VARCHAR,
    descr_logro VARCHAR,
    progreso_requerido INTEGER,
    icono_logro VARCHAR,
    calidad_logro VARCHAR,
    cod_rec INTEGER,
    monto_rec DECIMAL(12,2),
    estado_obtencion VARCHAR,
    fechaObtencion_logro TIMESTAMP,
    progreso_actual INTEGER
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.cod_logro,
        l.titulo_logro,
        l.descr_logro,
        l.progreso_requerido,
        l.icono_logro,
        l.calidad_logro,
        r.cod_rec,
        r.monto_rec,
        CASE 
            WHEN ul.fechaObtencion_logro IS NOT NULL THEN 'OBTENIDO'
            ELSE 'NO OBTENIDO'
        END AS estado_obtencion,
        ul.fechaObtencion_logro,
        ul.progreso_actual
    FROM LOGRO l
    LEFT JOIN USUARIO_LOGRO ul ON l.cod_logro = ul.cod_logro AND ul.id_us = p_id_us
    LEFT JOIN RECOMPENSA_LOGRO rl ON l.cod_logro = rl.cod_logro
    LEFT JOIN RECOMPENSA r ON rl.cod_rec = r.cod_rec
    ORDER BY 
        CASE WHEN ul.fechaObtencion_logro IS NOT NULL THEN 1 ELSE 2 END,
        ul.fechaObtencion_logro DESC;
END;
$$ LANGUAGE plpgsql;


--ver huella co2 de un usuario
CREATE OR REPLACE PROCEDURE sp_getHuellaCO2UsuarioCompleto(
    IN p_id_us INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT 
        u.id_us,
        u.handle_name,
        u.nom_us,
        u.foto_us,
        du.huella_co2,
        du.cant_ventas,
        du.fecha_registro
    FROM USUARIO u
    INNER JOIN DETALLE_USUARIO du ON u.id_us = du.id_us
    WHERE u.id_us = p_id_us;
END;
$$;

--obtener ranking de usuarios por huelal co2
CREATE OR REPLACE FUNCTION sp_getRankingHuellaCO2(p_top_n INTEGER DEFAULT 10)
RETURNS TABLE (
    id_us INTEGER,
    handle_name VARCHAR,
    nom_us VARCHAR,
    foto_us BYTEA,
    huella_co2 NUMERIC(10,2),
    cant_ventas INTEGER,
    posicion_ranking INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_us,
        u.handle_name,
        u.nom_us,
        u.foto_us,
        du.huella_co2,
        du.cant_ventas,
        DENSE_RANK() OVER (ORDER BY du.huella_co2 ASC) AS posicion_ranking
    FROM USUARIO u
    INNER JOIN DETALLE_USUARIO du ON u.id_us = du.id_us
    WHERE u.estado_us = 'activo'
      AND du.huella_co2 > 0
    ORDER BY du.huella_co2 ASC
    LIMIT p_top_n;
END;
$$;

--FALTA CALCULO DEL CO2 POR PUBLICACION Y CALCULO DE PORCENTAJE EN TOTAL POR USUARIO EN CO2


--obtener historial de accesos de uu usuario
CREATE OR REPLACE FUNCTION sp_getHistorialAccesosUsuario(p_id_us INTEGER)
RETURNS TABLE (
    cod_acc INTEGER,
    fecha_acc TIMESTAMP,
    estado_acc VARCHAR,
    contra_acc VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.cod_acc,
        a.fecha_acc,
        a.estado_acc,
        a.contra_acc
    FROM ACCESO a
    WHERE a.id_us = p_id_us
    ORDER BY a.fecha_acc DESC;
END;
$$;



