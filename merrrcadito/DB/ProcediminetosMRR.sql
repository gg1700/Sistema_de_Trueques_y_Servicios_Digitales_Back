-- ============ CONVERSIÓN A POSTGRESQL (FUNCIONES/PROCEDIMIENTOS) ============

-- Nota: conéctate ya a la base deseada (Postgres no usa USE/GO).

-- 1) Registrar usuario
CREATE OR REPLACE FUNCTION sp_registrarusuario(
    _p_cod_rol INT,
    _p_ci VARCHAR(20),
    _p_nom_us VARCHAR(100),
    _p_handle_name VARCHAR(50),
    _p_ap_pat_us VARCHAR(50),
    _p_ap_mat_us VARCHAR(50),
    _p_contra_us VARCHAR(100),
    _p_fecha_nacimiento DATE,
    _p_sexo CHAR(1),
    _p_estado_us VARCHAR(20),
    _p_correo_us VARCHAR(100),
    _p_telefono_us VARCHAR(20),
    _p_foto_us BYTEA
) RETURNS void LANGUAGE sql AS $$
    INSERT INTO USUARIO (
        cod_rol, ci, nom_us, handle_name, ap_pat_us, ap_mat_us, contra_us,
        fecha_nacimiento, sexo, estado_us, correo_us, telefono_us, foto_us
    )
    VALUES (
        _p_cod_rol, _p_ci, _p_nom_us, _p_handle_name, _p_ap_pat_us, _p_ap_mat_us, _p_contra_us,
        _p_fecha_nacimiento, _p_sexo, _p_estado_us, _p_correo_us, _p_telefono_us, _p_foto_us
    );
$$;

-- 2) Verificar login de usuario (devuelve boolean)
CREATE OR REPLACE FUNCTION sp_verificarusuariologin(
    _p_handle_name VARCHAR(100),
    _p_contra_us   VARCHAR(100)
) RETURNS boolean LANGUAGE sql AS $$
    SELECT EXISTS(
        SELECT 1
        FROM USUARIO
        WHERE handle_name = _p_handle_name
          AND contra_us   = _p_contra_us
    );
$$;

-- 3) Actualizar usuario (nombre, correo, teléfono)
CREATE OR REPLACE FUNCTION sp_actualizarusuario(
    _p_id_us INTEGER,
    _p_nom_us VARCHAR(100) DEFAULT NULL,
    _p_correo_us VARCHAR(100) DEFAULT NULL,
    _p_telefono_us VARCHAR(20) DEFAULT NULL
) RETURNS void LANGUAGE sql AS $$
    UPDATE USUARIO
       SET nom_us     = COALESCE(_p_nom_us, nom_us),
           correo_us  = COALESCE(_p_correo_us, correo_us),
           telefono_us= COALESCE(_p_telefono_us, telefono_us)
     WHERE id_us = _p_id_us;
$$;

-- 4) Registrar Promoción (calcula duración)
CREATE OR REPLACE FUNCTION sp_registrarpromocion(
    _p_titulo_prom VARCHAR(100),
    _p_fecha_ini_prom TIMESTAMP,
    _p_fecha_fin_prom TIMESTAMP,
    _p_descr_prom VARCHAR(300),
    _p_banner_prom BYTEA,
    _p_descuento_prom DECIMAL(5,2)
) RETURNS void LANGUAGE sql AS $$
    INSERT INTO PROMOCION(
        titulo_prom, fecha_ini_prom, duracion_prom, fecha_fin_prom,
        descr_prom, banner_prom, descuento_prom
    )
    VALUES(
        _p_titulo_prom,
        _p_fecha_ini_prom,
        CAST(DATE_PART('day', _p_fecha_fin_prom - _p_fecha_ini_prom) AS INTEGER),
        _p_fecha_fin_prom,
        _p_descr_prom,
        _p_banner_prom,
        _p_descuento_prom
    );
$$;

-- 5) Obtener promociones (productos + servicios)
CREATE OR REPLACE FUNCTION sp_getpromocionesactivas()
RETURNS TABLE(
    cod_prom INT,
    titulo_prom VARCHAR,
    fecha_ini_prom TIMESTAMP,
    duracion_prom INT,
    fecha_fin_prom TIMESTAMP,
    descr_prom VARCHAR,
    banner_prom BYTEA,
    descuento_prom DECIMAL(5,2),
    id_asociado INT,
    nombre_asociado VARCHAR,
    tipo_asociado VARCHAR
) LANGUAGE sql AS $$
    SELECT
        p.cod_prom, p.titulo_prom, p.fecha_ini_prom, p.duracion_prom, p.fecha_fin_prom,
        p.descr_prom, p.banner_prom, p.descuento_prom,
        pr.id_prod AS id_asociado, prod.nom_prod AS nombre_asociado, 'PRODUCTO' AS tipo_asociado
    FROM PROMOCION p
    JOIN PROMOCION_PRODUCTO pr ON p.cod_prom = pr.cod_prom
    JOIN PRODUCTO prod ON pr.id_prod = prod.id_prod

    UNION ALL

    SELECT
        p.cod_prom, p.titulo_prom, p.fecha_ini_prom, p.duracion_prom, p.fecha_fin_prom,
        p.descr_prom, p.banner_prom, p.descuento_prom,
        ps.id_serv AS id_asociado, s.nom_serv AS nombre_asociado, 'SERVICIO' AS tipo_asociado
    FROM PROMOCION p
    JOIN PROMOCION_SERVICIO ps ON p.cod_prom = ps.cod_prom
    JOIN SERVICIO s ON ps.id_serv = s.id_serv
$$;

-- 6) Publicaciones de un usuario
CREATE OR REPLACE FUNCTION sp_getpublicacionesusuario(
    _p_id_usuario INT
) RETURNS TABLE(
    cod_pub INT,
    id_us INT,
    fecha_ini_pub DATE,
    fecha_fin_pub DATE,
    foto_pub BYTEA,
    calif_pond_pub DECIMAL(3,2),
    impacto_amb_pub DECIMAL(10,2),
    id_prod INT,
    cant_prod INT,
    unidad_medida VARCHAR,
    id_serv INT,
    hrs_ini_dia_serv TIME,
    hrs_fin_dia_serv TIME
) LANGUAGE sql AS $$
    SELECT
        p.cod_pub, p.id_us, p.fecha_ini_pub, p.fecha_fin_pub, p.foto_pub,
        p.calif_pond_pub, p.impacto_amb_pub,
        pp.id_prod, pp.cant_prod, pp.unidad_medida,
        ps.id_serv, ps.hrs_ini_dia_serv, ps.hrs_fin_dia_serv
    FROM PUBLICACION p
    LEFT JOIN PUBLICACION_PRODUCTO pp ON p.cod_pub = pp.cod_pub
    LEFT JOIN PUBLICACION_SERVICIO ps ON p.cod_pub = ps.cod_pub
    WHERE p.id_us = _p_id_usuario
    ORDER BY p.fecha_ini_pub DESC
$$;

-- 7) Registrar evento
CREATE OR REPLACE FUNCTION sp_registrarevento(
    _p_id_org INT,
    _p_titulo_evento VARCHAR(100),
    _p_descripcion_evento VARCHAR(200),
    _p_fecha_inicio_evento DATE,
    _p_fecha_finalizacion_evento DATE,
    _p_tipo_evento VARCHAR(20)
) RETURNS void LANGUAGE sql AS $$
    INSERT INTO EVENTO(
        id_org, titulo_evento, descripcion_evento, fecha_registro_evento,
        fecha_inicio_evento, fecha_finalizacion_evento, duracion_evento, tipo_evento
    )
    VALUES(
        _p_id_org, _p_titulo_evento, _p_descripcion_evento, NOW(),
        _p_fecha_inicio_evento, _p_fecha_finalizacion_evento,
        CAST(DATE_PART('day', _p_fecha_finalizacion_evento::timestamp - _p_fecha_inicio_evento::timestamp) AS INTEGER),
        _p_tipo_evento
    );
$$;

-- 8) Participar en evento
CREATE OR REPLACE FUNCTION sp_participarevento(
    _p_id_us INT,
    _p_cod_evento INT
) RETURNS void LANGUAGE sql AS $$
    INSERT INTO USUARIO_EVENTO(cod_evento, id_us)
    VALUES(_p_cod_evento, _p_id_us);
$$;

-- 9) Historial de transacciones de un usuario
CREATE OR REPLACE FUNCTION sp_historiatransaccionesusuario(
    _p_id_us INT
) RETURNS SETOF TRANSACCION LANGUAGE sql AS $$
    SELECT *
    FROM TRANSACCION
    WHERE id_us_destino = _p_id_us
       OR id_us_origen  = _p_id_us
$$;

-- 10) Listar eventos activos (estado correcto: 'vigente')
CREATE OR REPLACE FUNCTION sp_geteventosactivos()
RETURNS SETOF EVENTO LANGUAGE sql AS $$
    SELECT *
    FROM EVENTO
    WHERE estado_evento = 'vigente'
$$;

-- 11) Listar categorías de PRODUCTO
CREATE OR REPLACE FUNCTION sp_getcategoriasproducto()
RETURNS TABLE(cod_cat INT, nom_cat VARCHAR) LANGUAGE sql AS $$
    SELECT c.cod_cat, c.nom_cat
    FROM CATEGORIA c
    WHERE LOWER(c.tipo_cat) = 'producto'
    ORDER BY c.cod_cat
$$;

-- 12) Listar categorías de SERVICIO
CREATE OR REPLACE FUNCTION sp_getcategoriasservicio()
RETURNS TABLE(cod_cat INT, nom_cat VARCHAR) LANGUAGE sql AS $$
    SELECT c.cod_cat, c.nom_cat
    FROM CATEGORIA c
    WHERE LOWER(c.tipo_cat) = 'servicio'
    ORDER BY c.cod_cat
$$;

-- 13) Ver categoría seleccionada
CREATE OR REPLACE FUNCTION sp_vercategoria(_p_cod_cat INT)
RETURNS TABLE(
    cod_cat INT, nom_cat VARCHAR, descr_cat VARCHAR, imagen_repr BYTEA, tipo_cat VARCHAR
) LANGUAGE sql AS $$
    SELECT c.cod_cat, c.nom_cat, c.descr_cat, c.imagen_repr, c.tipo_cat
    FROM CATEGORIA c
    WHERE c.cod_cat = _p_cod_cat
$$;

-- 14) Actualizar categoría
CREATE OR REPLACE FUNCTION sp_actualizarcategoria(
    _p_cod_cat INT,
    _p_nom_cat VARCHAR(100) DEFAULT NULL,
    _p_descr_cat VARCHAR(200) DEFAULT NULL,
    _p_imagen_repr BYTEA DEFAULT NULL,
    _p_tipo_cat VARCHAR(20) DEFAULT NULL
) RETURNS void LANGUAGE sql AS $$
    UPDATE CATEGORIA
       SET nom_cat     = COALESCE(_p_nom_cat, nom_cat),
           descr_cat   = COALESCE(_p_descr_cat, descr_cat),
           imagen_repr = COALESCE(_p_imagen_repr, imagen_repr),
           tipo_cat    = COALESCE(_p_tipo_cat, tipo_cat)
     WHERE cod_cat = _p_cod_cat;
$$;

-- 15) Listar subcategorías
CREATE OR REPLACE FUNCTION sp_getsubcategorias()
RETURNS TABLE(
    cod_subcat_prod INT,
    nom_subcat_prod VARCHAR,
    cod_cat INT
) LANGUAGE sql AS $$
    SELECT sub.cod_subcat_prod, sub.nom_subcat_prod, sub.cod_cat
    FROM SUBCATEGORIA_PRODUCTO sub
    ORDER BY sub.cod_cat
$$;

-- 16) Ver subcategoría
CREATE OR REPLACE FUNCTION sp_versubcategoria(_p_cod_subcat_prod INT)
RETURNS TABLE(
    cod_subcat_prod INT,
    nom_subcat_prod VARCHAR,
    nom_cat VARCHAR,
    descr_subcat_prod VARCHAR,
    imagen_representativa BYTEA
) LANGUAGE sql AS $$
    SELECT sub.cod_subcat_prod, sub.nom_subcat_prod, c.nom_cat,
           sub.descr_subcat_prod, sub.imagen_representativa
    FROM SUBCATEGORIA_PRODUCTO sub
    JOIN CATEGORIA c ON c.cod_cat = sub.cod_cat
    WHERE sub.cod_subcat_prod = _p_cod_subcat_prod
$$;

-- 17) Actualizar subcategoría
CREATE OR REPLACE FUNCTION sp_actualizarsubcategoria(
    _p_cod_subcat_prod INT,
    _p_cod_cat INT DEFAULT NULL,
    _p_nom_subcat_prod VARCHAR(100) DEFAULT NULL,
    _p_imagen_representativa BYTEA DEFAULT NULL,
    _p_descr_subcat_prod VARCHAR(200) DEFAULT NULL
) RETURNS void LANGUAGE sql AS $$
    UPDATE SUBCATEGORIA_PRODUCTO
       SET cod_cat               = COALESCE(_p_cod_cat, cod_cat),
           nom_subcat_prod       = COALESCE(_p_nom_subcat_prod, nom_subcat_prod),
           imagen_representativa = COALESCE(_p_imagen_representativa, imagen_representativa),
           descr_subcat_prod     = COALESCE(_p_descr_subcat_prod, descr_subcat_prod)
     WHERE cod_subcat_prod = _p_cod_subcat_prod;
$$;

-- 18) Listar subcategorías de una categoría
CREATE OR REPLACE FUNCTION sp_getsubcategoriasdecategoria(_p_cod_cat INT)
RETURNS TABLE(
    cod_subcat_prod INT,
    nom_subcat_prod VARCHAR,
    imagen_representativa BYTEA
) LANGUAGE sql AS $$
    SELECT cod_subcat_prod, nom_subcat_prod, imagen_representativa
    FROM SUBCATEGORIA_PRODUCTO
    WHERE cod_cat = _p_cod_cat
$$;

-- 19) Publicaciones de SERVICIO por categoría
CREATE OR REPLACE FUNCTION sp_getpublicacionesservicioporcategoria(_p_cod_cat INT)
RETURNS TABLE(
    cod_pub INT,
    foto_pub BYTEA,
    calif_pond_pub DECIMAL(3,2),
    impacto_amb_pub DECIMAL(10,2),
    id_serv INT,
    nom_serv VARCHAR,
    desc_serv VARCHAR,
    precio_serv DECIMAL(10,2),
    duracion_serv INT,
    handle_name VARCHAR,
    foto_us BYTEA,
    hrs_ini_dia_serv TIME,
    hrs_fin_dia_serv TIME
) LANGUAGE sql AS $$
    SELECT
        p.cod_pub, p.foto_pub, p.calif_pond_pub, p.impacto_amb_pub,
        s.id_serv, s.nom_serv, s.desc_serv, s.precio_serv, s.duracion_serv,
        u.handle_name, u.foto_us, ps.hrs_ini_dia_serv, ps.hrs_fin_dia_serv
    FROM PUBLICACION p
    JOIN PUBLICACION_SERVICIO ps ON p.cod_pub = ps.cod_pub
    JOIN SERVICIO s ON ps.id_serv = s.id_serv
    JOIN CATEGORIA c ON s.cod_cat = c.cod_cat
    JOIN USUARIO u ON p.id_us = u.id_us
    WHERE c.cod_cat = _p_cod_cat
      AND LOWER(c.tipo_cat) = 'servicio'
$$;

-- 20) Publicaciones de PRODUCTO por subcategoría
CREATE OR REPLACE FUNCTION sp_getpublicacionesproductoporsubcategoria(_p_cod_subcat_prod INT)
RETURNS TABLE(
    cod_pub INT,
    foto_pub BYTEA,
    calif_pond_pub DECIMAL(3,2),
    impacto_amb_pub DECIMAL(10,2),
    id_prod INT,
    nom_prod VARCHAR,
    desc_prod VARCHAR,
    precio_prod DECIMAL(10,2),
    cant_prod INT,
    unidad_medida VARCHAR,
    handle_name VARCHAR,
    foto_us BYTEA
) LANGUAGE sql AS $$
    SELECT
        p.cod_pub, p.foto_pub, p.calif_pond_pub, p.impacto_amb_pub,
        pr.id_prod, pr.nom_prod, pr.desc_prod, pr.precio_prod,
        ppr.cant_prod, ppr.unidad_medida,
        u.handle_name, u.foto_us
    FROM PUBLICACION p
    JOIN USUARIO u ON u.id_us = p.id_us
    JOIN PUBLICACION_PRODUCTO ppr ON ppr.cod_pub = p.cod_pub
    JOIN PRODUCTO pr ON pr.id_prod = ppr.id_prod
    JOIN SUBCATEGORIA_PRODUCTO sub ON sub.cod_subcat_prod = pr.cod_subcat_prod
    WHERE sub.cod_subcat_prod = _p_cod_subcat_prod
$$;

-- PROCEDIMIENTOS ALMACENADOS PARA EL CALCULO DE CO2
