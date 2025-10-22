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

-- ====== PROCEDIMIENTOS ALMACENADOS PARA EL CALCULO DE CO2 ========

-- Calcular CO2 usando la tabla de equivalencias
CREATE OR REPLACE FUNCTION sp_calcular_co2_producto_equivalencia(
    _p_id_prod INTEGER,
    _p_cantidad DECIMAL(10,2),
    _p_unidad VARCHAR(20) DEFAULT 'kg'
) RETURNS DECIMAL(10,2) LANGUAGE plpgsql AS $$
DECLARE
    _total_co2 DECIMAL(10,2) := 0;
    _material_co2 DECIMAL(10,4);
    _factor_equiv DECIMAL(12,6);
    _material_record RECORD;
BEGIN
    FOR _material_record IN 
        SELECT mp.id_mat, m.factor_co2, m.nom_mat
        FROM MATERIAL_PRODUCTO mp
        JOIN MATERIAL m ON mp.id_mat = m.id_mat
        WHERE mp.id_prod = _p_id_prod
    LOOP
        SELECT factor_conversion INTO _factor_equiv
        FROM EQUIVALENCIA_CO2
        WHERE id_mat = _material_record.id_mat 
          AND unidad_origen = _p_unidad
          AND unidad_destino = 'kg_co2';
        
        IF _factor_equiv IS NULL THEN
            _material_co2 := _p_cantidad * _material_record.factor_co2;
        ELSE
            _material_co2 := _p_cantidad * _factor_equiv;
        END IF;
        
        _total_co2 := _total_co2 + _material_co2;
        
        RAISE NOTICE 'Material: %, CO2: % kg', 
            _material_record.nom_mat, _material_co2;
    END LOOP;
    
    RETURN _total_co2;
END;
$$;

-- USO:
-- SELECT sp_calcular_co2_producto_equivalencia(1, 2.5, 'kg') AS co2_total;
-- Calcula el CO2 de 2.5kg del producto ID 1

-- Registrar nueva equivalencia con validación
CREATE OR REPLACE FUNCTION sp_registrar_equivalencia(
    _p_id_mat INTEGER,
    _p_unidad_origen VARCHAR(20),
    _p_factor_conversion DECIMAL(12,6),
    _p_descripcion VARCHAR(200) DEFAULT NULL,
    _p_fuente_datos VARCHAR(200) DEFAULT NULL
) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
    _nuevo_id INTEGER;
    _material_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM MATERIAL WHERE id_mat = _p_id_mat) 
    INTO _material_exists;
    
    IF NOT _material_exists THEN
        RAISE EXCEPTION 'El material con ID % no existe', _p_id_mat;
    END IF;
    
    INSERT INTO EQUIVALENCIA_CO2 (
        id_mat, unidad_origen, unidad_destino, factor_conversion, 
        descripcion, fuente_datos, fecha_actualizacion
    ) VALUES (
        _p_id_mat, _p_unidad_origen, 'kg_co2', _p_factor_conversion,
        _p_descripcion, _p_fuente_datos, NOW()
    )
    RETURNING id_equiv INTO _nuevo_id;
    
    RETURN _nuevo_id;
END;
$$;

-- USO:
-- SELECT sp_registrar_equivalencia(1, 'ton', 1000, 'Conversión toneladas a kg CO2', 'EPA 2024');
-- Registra que 1 tonelada = 1000 kg CO2 para el material ID 1



-- Actualizar huella de carbono de un usuario sumando todas sus publicaciones
CREATE OR REPLACE FUNCTION sp_actualizar_huella_usuario(
    _p_id_us INTEGER
) RETURNS DECIMAL(10,2) LANGUAGE plpgsql AS $$
DECLARE
    _nueva_huella DECIMAL(10,2) := 0;
    _publicacion_record RECORD;
    _co2_publicacion DECIMAL(10,2);
BEGIN
    FOR _publicacion_record IN 
        SELECT p.cod_pub, pp.id_prod, pp.cant_prod, pp.unidad_medida,
               pr.peso_prod, ps.id_serv
        FROM PUBLICACION p
        LEFT JOIN PUBLICACION_PRODUCTO pp ON p.cod_pub = pp.cod_pub
        LEFT JOIN PRODUCTO pr ON pp.id_prod = pr.id_prod
        LEFT JOIN PUBLICACION_SERVICIO ps ON p.cod_pub = ps.cod_pub
        WHERE p.id_us = _p_id_us 
          AND p.fecha_fin_pub >= CURRENT_DATE
    LOOP
        IF _publicacion_record.id_prod IS NOT NULL THEN
            _co2_publicacion := sp_calcular_co2_producto_equivalencia(
                _publicacion_record.id_prod,
                _publicacion_record.cant_prod,
                COALESCE(_publicacion_record.unidad_medida, 'kg')
            );
        ELSIF _publicacion_record.id_serv IS NOT NULL THEN
            _co2_publicacion := 0; -- Por implementar para servicios
        ELSE
            _co2_publicacion := 0;
        END IF;
        
        _nueva_huella := _nueva_huella + _co2_publicacion;
        
        UPDATE PUBLICACION 
        SET impacto_amb_pub = _co2_publicacion
        WHERE cod_pub = _publicacion_record.cod_pub;
    END LOOP;
    
    UPDATE DETALLE_USUARIO 
    SET huella_co2 = _nueva_huella
    WHERE id_us = _p_id_us;
    
    RETURN _nueva_huella;
END;
$$;

-- USO:
-- SELECT sp_actualizar_huella_usuario(123) AS huella_actualizada;



-- Obtener todas las equivalencias de un material
CREATE OR REPLACE FUNCTION sp_get_equivalencias_material(
    _p_id_mat INTEGER
) RETURNS TABLE(
    id_equiv INTEGER,
    unidad_origen VARCHAR,
    factor_conversion DECIMAL,
    descripcion VARCHAR,
    fecha_actualizacion TIMESTAMP,
    fuente_datos VARCHAR,
    nom_mat VARCHAR
) LANGUAGE sql AS $$
    SELECT 
        e.id_equiv, e.unidad_origen, e.factor_conversion,
        e.descripcion, e.fecha_actualizacion, e.fuente_datos,
        m.nom_mat
    FROM EQUIVALENCIA_CO2 e
    JOIN MATERIAL m ON e.id_mat = m.id_mat
    WHERE e.id_mat = _p_id_mat
    ORDER BY e.unidad_origen;
$$;

-- USO:
-- SELECT * FROM sp_get_equivalencias_material(1);



-- Convertir entre diferentes unidades usando equivalencias
CREATE OR REPLACE FUNCTION sp_convertir_unidad_co2(
    _p_id_mat INTEGER,
    _p_cantidad DECIMAL(12,4),
    _p_unidad_origen VARCHAR(20),
    _p_unidad_destino VARCHAR(20) DEFAULT 'kg_co2'
) RETURNS DECIMAL(12,4) LANGUAGE plpgsql AS $$
DECLARE
    _factor_origen DECIMAL(12,6);
    _factor_destino DECIMAL(12,6);
    _resultado DECIMAL(12,4);
BEGIN
    SELECT factor_conversion INTO _factor_origen
    FROM EQUIVALENCIA_CO2
    WHERE id_mat = _p_id_mat 
      AND unidad_origen = _p_unidad_origen
      AND unidad_destino = 'kg_co2';
    
    SELECT factor_conversion INTO _factor_destino
    FROM EQUIVALENCIA_CO2
    WHERE id_mat = _p_id_mat 
      AND unidad_origen = _p_unidad_destino
      AND unidad_destino = 'kg_co2';
    
    IF _factor_origen IS NULL THEN
        RAISE EXCEPTION 'No existe equivalencia para % en el material ID %', 
            _p_unidad_origen, _p_id_mat;
    END IF;
    
    IF _factor_destino IS NULL AND _p_unidad_destino != 'kg_co2' THEN
        RAISE EXCEPTION 'No existe equivalencia para % en el material ID %', 
            _p_unidad_destino, _p_id_mat;
    END IF;
    
    IF _p_unidad_destino = 'kg_co2' THEN
        _resultado := _p_cantidad * _factor_origen;
    ELSE
        _resultado := (_p_cantidad * _factor_origen) / _factor_destino;
    END IF;
    
    RETURN _resultado;
END;
$$;

-- USO:
-- SELECT sp_convertir_unidad_co2(1, 100, 'kg', 'ton') AS equivalente_ton;
-- Convierte 100 kg de material ID 1 a toneladas equivalentes de CO2



-- Generar reporte detallado de impacto ambiental
CREATE OR REPLACE FUNCTION sp_reporte_impacto_ambiental(
    _p_id_us INTEGER
) RETURNS TABLE(
    tipo_publicacion VARCHAR,
    nombre_item VARCHAR,
    cantidad DECIMAL(10,2),
    unidad VARCHAR,
    co2_generado DECIMAL(10,2),
    fecha_publicacion DATE
) LANGUAGE sql AS $$
    SELECT 
        'Producto' AS tipo_publicacion,
        pr.nom_prod AS nombre_item,
        pp.cant_prod AS cantidad,
        COALESCE(pp.unidad_medida, 'kg') AS unidad,
        p.impacto_amb_pub AS co2_generado,
        p.fecha_ini_pub AS fecha_publicacion
    FROM PUBLICACION p
    JOIN PUBLICACION_PRODUCTO pp ON p.cod_pub = pp.cod_pub
    JOIN PRODUCTO pr ON pp.id_prod = pr.id_prod
    WHERE p.id_us = _p_id_us
    
    UNION ALL
    
    SELECT 
        'Servicio' AS tipo_publicacion,
        s.nom_serv AS nombre_item,
        1 AS cantidad,
        'unidad' AS unidad,
        p.impacto_amb_pub AS co2_generado,
        p.fecha_ini_pub AS fecha_publicacion
    FROM PUBLICACION p
    JOIN PUBLICACION_SERVICIO ps ON p.cod_pub = ps.cod_pub
    JOIN SERVICIO s ON ps.id_serv = s.id_serv
    WHERE p.id_us = _p_id_us
    ORDER BY fecha_publicacion DESC;
$$;

-- USO:
-- SELECT * FROM sp_reporte_impacto_ambiental(123);

