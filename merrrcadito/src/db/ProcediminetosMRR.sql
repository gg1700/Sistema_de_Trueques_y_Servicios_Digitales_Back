-- ============ CONVERSIÓN A POSTGRESQL (FUNCIONES/PROCEDIMIENTOS) ============

-- Nota: conéctate ya a la base deseada (Postgres no usa USE/GO).

-- =========================================
--  1) REGISTRAR USUARIO
-- =========================================

-- Descripción:
-- Esta función almacena un nuevo registro en la tabla USUARIO.
-- Recibe como parámetros los datos personales, credenciales y atributos del usuario.
-- No realiza validaciones previas ni retorna valores; simplemente ejecuta la inserción.
CREATE OR REPLACE FUNCTION sp_registrarUsuario(
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

-- =========================================
--  2) VERIFICAR LOGIN DE USUARIO (devuelve boolean)
-- =========================================

-- Descripción:
-- Esta función verifica si existen credenciales válidas para iniciar sesión.
-- Comprueba si el nombre de usuario y la contraseña coinciden con un registro en la tabla USUARIO.
-- Retorna un valor booleano: TRUE si existe coincidencia, FALSE en caso contrario.
CREATE OR REPLACE FUNCTION sp_verificarUsuarioLogin(
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

-- =========================================
--  3) ACTUALIZAR USUARIO (nombre, correo, teléfono...)
-- =========================================

-- Descripción:
-- Esta función actualiza los datos básicos de un usuario en la tabla USUARIO.
-- Permite modificar el nombre, correo electrónico, número de teléfono, etc de un usuario específico.
-- Si alguno de los parámetros es NULL, se conserva el valor actual en la base de datos.
CREATE OR REPLACE FUNCTION sp_actualizarUsuario(
   _p_cod_us INTEGER,
   _p_nom_us VARCHAR(100) DEFAULT NULL,
   _p_handle_name VARCHAR(50),
   _p_ap_pat_us VARCHAR(50),
   _p_ap_mat_us VARCHAR(50),
   _p_correo_us VARCHAR(100) DEFAULT NULL,
   _p_telefono_us VARCHAR(20) DEFAULT NULL,
   _p_foto_us BYTEA
) RETURNS void LANGUAGE sql AS $$
   UPDATE USUARIO
      SET nom_us     = COALESCE(_p_nom_us, nom_us),
          correo_us  = COALESCE(_p_correo_us, correo_us),
          telefono_us= COALESCE(_p_telefono_us, telefono_us),
          handle_name= COALESCE(_p_handle_name, handle_name),
          ap_pat_name= COALESCE(_p_ap_pat_us, ap_pat_us),
          ap_mat_name= COALESCE(_p_ap_mat_us,ap_mat_us),
          foto_us= COALESCE(_p_foto_us, foto_us)
    WHERE cod_us = _p_cod_us;
$$;

-- =========================================
--  4) REGISTRAR CATEGORÍA
-- =========================================

-- Descripción:
-- Este procedimiento almacena una nueva categoría en la tabla CATEGORIA.
-- Recibe como parámetros el nombre, descripción, imagen representativa y tipo de categoría.
-- No realiza validaciones previas ni retorna valores; simplemente ejecuta la inserción.

CREATE OR REPLACE PROCEDURE sp_registrarCategoria(
   _p_nom_cat VARCHAR(100),
    _p_descr_cat VARCHAR(200),
    _p_imagen_repr BYTEA,
    _p_tipo_cat VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO CATEGORIA (
        nom_cat,
        descr_cat,
        imagen_repr,
        tipo_cat
    ) VALUES (
        p_nom_cat,
        p_descr_cat,
        p_imagen_repr,
        p_tipo_cat
    );
END;
$$;

-- =========================================
--  5) VER CATEGORÍA SELECCIONADA
-- =========================================

-- Descripción:
-- Esta función retorna los datos completos de una categoría específica registrada en la tabla CATEGORIA.
-- Utiliza el código de categoría como parámetro de búsqueda y devuelve una fila con sus atributos.
CREATE OR REPLACE FUNCTION sp_verCategoria(_p_cod_cat INT)
RETURNS TABLE(
    cod_cat INT, nom_cat VARCHAR, descr_cat VARCHAR, imagen_repr BYTEA, tipo_cat VARCHAR
) LANGUAGE sql AS $$
    SELECT c.cod_cat, c.nom_cat, c.descr_cat, c.imagen_repr, c.tipo_cat
    FROM CATEGORIA c
    WHERE c.cod_cat = _p_cod_cat
$$;

-- =========================================
--  6) LISTAR CATEGORÍAS DE PRODUCTO
-- =========================================

-- Descripción:
-- Esta función retorna una lista de todas las categorías cuyo tipo sea 'producto'.
-- Filtra los registros de la tabla CATEGORIA comparando el campo tipo_cat (en minúsculas) con el valor 'producto'.
-- Devuelve únicamente el código y el nombre de cada categoría, ordenados por su código.
CREATE OR REPLACE FUNCTION sp_getCategoriasProducto()
RETURNS TABLE(cod_cat INT, nom_cat VARCHAR) LANGUAGE sql AS $$
    SELECT c.cod_cat, c.nom_cat
    FROM CATEGORIA c
    WHERE LOWER(c.tipo_cat) = 'producto'
    ORDER BY c.cod_cat
$$;

-- =========================================
--  7) LISTAR CATEGORÍAS DE SERVICIO
-- =========================================

-- Descripción:
-- Esta función retorna una lista de todas las categorías cuyo tipo sea 'servicio'.
-- Filtra los registros de la tabla CATEGORIA comparando el campo tipo_cat (en minúsculas) con el valor 'servicio'.
-- Devuelve únicamente el código y el nombre de cada categoría, ordenados por su código.
CREATE OR REPLACE FUNCTION sp_getCategoriasServicio()
RETURNS TABLE(cod_cat INT, nom_cat VARCHAR) LANGUAGE sql AS $$
    SELECT c.cod_cat, c.nom_cat
    FROM CATEGORIA c
    WHERE LOWER(c.tipo_cat) = 'servicio'
    ORDER BY c.cod_cat
$$;

-- =========================================
--  8) ACTUALIZAR CATEGORÍA
-- =========================================

-- Descripción:
-- Esta función actualiza los datos de una categoría existente en la tabla CATEGORIA.
-- Permite modificar el nombre, descripción, imagen representativa y tipo de categoría.
-- Si alguno de los parámetros es NULL, se conserva el valor actual en la base de datos.
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

-- =========================================
--  9) REGISTRAR SUBCATEGORÍA DE PRODUCTO
-- =========================================

-- Descripción:
-- Este procedimiento registra una nueva subcategoría asociada a una categoría de tipo producto.
-- Inserta los datos en la tabla SUBCATEGORIA_PRODUCTO, incluyendo nombre, descripción e imagen representativa
CREATE OR REPLACE PROCEDURE sp_registrarSubcategoriaProducto(
    _p_cod_cat INTEGER,
    _p_nom_subcat_prod VARCHAR(100),
    _p_descr_subcat_prod VARCHAR(200),
    _p_imagen_representativa BYTEA
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO SUBCATEGORIA_PRODUCTO (
        cod_cat,
        nom_subcat_prod,
        descr_subcat_prod,
        imagen_representativa
    ) VALUES (
        p_cod_cat,
        p_nom_subcat_prod,
        p_descr_subcat_prod,
        p_imagen_representativa
    );
END;
$$;

-- =========================================
-- 10) LISTAR SUBCATEGORÍAS
-- =========================================

-- Descripción:
-- Esta función retorna una lista de todas las subcategorías registradas en la tabla SUBCATEGORIA_PRODUCTO.
-- Devuelve el código de subcategoría, su nombre y el código de la categoría a la que pertenece.
-- Los resultados se ordenan por el código de categoría.
CREATE OR REPLACE FUNCTION sp_getSubcategorias()
RETURNS TABLE(
    cod_subcat_prod INT,
    nom_subcat_prod VARCHAR,
    cod_cat INT
) LANGUAGE sql AS $$
    SELECT sub.cod_subcat_prod, sub.nom_subcat_prod, sub.cod_cat
    FROM SUBCATEGORIA_PRODUCTO sub
    ORDER BY sub.cod_cat
$$;

-- =========================================
-- 11) VER SUBCATEGORÍA
-- =========================================

-- Descripción:
-- Esta función retorna los datos completos de una subcategoría específica de producto.
-- Realiza una unión entre las tablas SUBCATEGORIA_PRODUCTO y CATEGORIA para incluir el nombre de la categoría asociada.
-- Devuelve una fila con los atributos principales de la subcategoría.
CREATE OR REPLACE FUNCTION sp_verSubcategoria(_p_cod_subcat_prod INT)
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

-- =========================================
-- 12) ACTUALIZAR SUBCATEGORÍA
-- =========================================

-- Descripción:
-- Esta función actualiza los datos de una subcategoría de producto en la tabla SUBCATEGORIA_PRODUCTO.
-- Permite modificar el nombre, descripción, imagen representativa y categoría asociada.
-- Si alguno de los parámetros es NULL, se conserva el valor actual en la base de datos.
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

-- =========================================
-- 13) LISTAR SUBCATEGORÍAS DE UNA CATEGORÍA
-- =========================================

-- Descripción:
-- Esta función retorna todas las subcategorías asociadas a una categoría específica.
-- Filtra los registros de la tabla SUBCATEGORIA_PRODUCTO según el código de categoría recibido como parámetro.
-- Devuelve el código, nombre e imagen representativa de cada subcategoría.
CREATE OR REPLACE FUNCTION sp_getSubcategoriasDeCategoria(_p_cod_cat INT)
RETURNS TABLE(
    cod_subcat_prod INT,
    nom_subcat_prod VARCHAR,
    imagen_representativa BYTEA
) LANGUAGE sql AS $$
    SELECT cod_subcat_prod, nom_subcat_prod, imagen_representativa
    FROM SUBCATEGORIA_PRODUCTO
    WHERE cod_cat = _p_cod_cat
$$;

-- =========================================
-- 14) REGISTRAR PUBLICACIÓN DE PRODUCTO
-- =========================================

-- Descripción:
-- Esta función registra un nuevo producto y lo asocia a una publicación.
-- Inserta datos en las tablas PRODUCTO, MATERIAL_PRODUCTO, PUBLICACION y PUBLICACION_PRODUCTO.
-- La publicación se genera con una duración de 1 mes desde la fecha actual.
-- El proceso incluye la creación del producto, su vínculo con el material, la publicación y el detalle de cantidad y unidad.
CREATE OR REPLACE FUNCTION sp_registrarPublicacionProducto(
  _p_cod_us INTEGER,
  _p_foto_pub BYTEA,
  _p_cod_cat INTEGER,
  _p_cod_subcat_prod INTEGER,
  _p_nom_prod VARCHAR(100),
  _p_estado_prod VARCHAR(20),
  _p_precio_prod DECIMAL(10,2),
  _p_id_mat INTEGER,
  _p_peso_prod DECIMAL(10,2),
  _p_marca_prod VARCHAR(50),
  _p_desc_prod VARCHAR(200),
  _p_cant_prod INTEGER,
  _p_unidad_medida VARCHAR(20)
)
RETURNS VOID AS $$
DECLARE
  pp_id_prod INTEGER;
  pp_cod_pub INTEGER;
  p_fecha_ini_pub DATE := CURRENT_DATE;
  p_fecha_fin_pub DATE := CURRENT_DATE + INTERVAL '1 month';
BEGIN
  
  BEGIN
   
    INSERT INTO PRODUCTO(
      cod_subcat_prod, nom_prod, estado_prod, precio_prod, 
      peso_prod, marca_prod, desc_prod
    ) VALUES(
      p_cod_subcat_prod, p_nom_prod, p_estado_prod, p_precio_prod,
      p_peso_prod, p_marca_prod, p_desc_prod
    ) RETURNING id_prod INTO pp_cod_prod;

    INSERT INTO MATERIAL_PRODUCTO(cod_mat, cod_prod)
    VALUES(p_cod_mat, pp_cod_prod);

    INSERT INTO PUBLICACION(
      cod_us, fecha_ini_pub, fecha_fin_pub, foto_pub
    ) VALUES(
      p_cod_us, p_fecha_ini_pub, p_fecha_fin_pub, p_foto_pub
    ) RETURNING cod_pub INTO pp_cod_pub;
    INSERT INTO PUBLICACION_PRODUCTO(
      cod_pub, cod_prod, cant_prod, unidad_medida
    ) VALUES(
      pp_cod_pub, pp_cod_prod, p_cant_prod, p_unidad_medida
    );
    COMMIT;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 15) REGISTRAR PUBLICACIÓN DE SERVICIO
-- =========================================

-- Descripción:
-- Este procedimiento registra un nuevo servicio y lo asocia a una publicación.
-- Inserta datos en las tablas SERVICIO, PUBLICACION y PUBLICACION_SERVICIO.
-- Calcula la duración del servicio en minutos a partir del horario de inicio y fin.
-- La publicación se genera con una duración de 1 mes desde la fecha actual.
CREATE OR REPLACE PROCEDURE sp_registrarPublicacionServicio(
    _p_foto_pub BYTEA,
    _p_cod_us INTEGER,
    _p_cod_cat INTEGER,
    _p_nom_serv VARCHAR(100),
    _p_desc_serv VARCHAR(200),
    _p_precio_serv NUMERIC(10, 2),
    _p_hrs_ini_dia_serv TIME,
    _p_hrs_fin_dia_serv TIME
)
LANGUAGE plpgsql
AS $$
DECLARE
    pp_cod_serv INTEGER;
    pp_cod_pub INTEGER;
    p_duracion_serv INTEGER := EXTRACT(EPOCH FROM (p_hrs_fin_dia_serv - p_hrs_ini_dia_serv)) / 60;
    p_fecha_ini_pub DATE := CURRENT_DATE;
    p_fecha_fin_pub DATE := CURRENT_DATE + INTERVAL '1 month';
BEGIN
    BEGIN
        INSERT INTO SERVICIO (
            nom_serv, desc_serv, precio_serv, cod_cat, duracion_serv
        ) VALUES (
            _p_nom_serv, _p_desc_serv, _p_precio_serv, _p_cod_cat, p_duracion_serv
        )
        RETURNING cod_serv INTO pp_cod_serv;

        INSERT INTO PUBLICACION (
            cod_us, foto_pub, fecha_ini_pub, fecha_fin_pub
        ) VALUES (
            _p_cod_us, :p_foto_pub, _p_fecha_ini_pub, _p_fecha_fin_pub
        )
        RETURNING cod_pub INTO pp_cod_pub;

        INSERT INTO PUBLICACION_SERVICIO (
            cod_serv, cod_pub, hrs_ini_dia_serv, hrs_fin_dia_serv
        ) VALUES (
            pp_cod_serv, pp_cod_pub, p_hrs_ini_dia_serv, p_hrs_fin_dia_serv
        );

        COMMIT;
END;
$$;

-- =========================================
-- 16) REGISTRAR PROMOCIÓN POR SUBCATEGORÍAS
-- =========================================

-- Descripción:
-- Este procedimiento registra una nueva promoción y la asocia a múltiples subcategorías de producto.
-- Calcula automáticamente la fecha de finalización en función de la duración indicada.
-- Inserta los datos en la tabla PROMOCION y luego vincula cada subcategoría listada en texto plano a través de PROMOCION_PRODUCTO.
CREATE OR REPLACE PROCEDURE sp_registrarPromocionSubcategoria(
    _p_titulo_prom VARCHAR(100),
    _p_fecha_ini_prom TIMESTAMP,
    _p_fecha_fin_prom TIMESTAMP, 
    _p_descr_prom VARCHAR(300),
    _p_banner_prom BYTEA DEFAULT NULL,
    _p_descuento_prom NUMERIC(5,2),
    _p_cod_subcat_prod INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    _p_duracion_prom INTEGER;
    cod_prom_nuevo INTEGER;
BEGIN
    
    _p_duracion_prom := EXTRACT(DAY FROM (p_fecha_fin_prom - p_fecha_ini_prom));

    INSERT INTO promocion (
        titulo_prom,
        fecha_ini_prom,
        duracion_prom,
        fecha_fin_prom,
        descr_prom,
        banner_prom,
        descuento_prom
    ) VALUES (
        _p_titulo_prom,
        _p_fecha_ini_prom,
        _p_duracion_prom, 
        _p_fecha_fin_prom,
        _p_descr_prom,
        _p_banner_prom,
        _p_descuento_prom
    )
    RETURNING cod_prom INTO cod_prom_nuevo;

    INSERT INTO PROMOCION_PRODUCTO (cod_subcat_prod, cod_prom)
    VALUES (_p_cod_subcat_prod, cod_prom_nuevo)
END;
$$;

-- =========================================
-- 17) REGISTRAR PROMOCIÓN POR CATEGORÍA
-- =========================================

-- Descripción:
-- Este procedimiento registra una nueva promoción y la asocia a una categoría específica.
-- Calcula automáticamente la duración de la promoción en días a partir de las fechas de inicio y finalización.
-- Inserta los datos en la tabla PROMOCION y luego vincula la categoría en PROMOCION_CATEGORIA.
CREATE OR REPLACE PROCEDURE sp_registrarPromocionCategoria(
    _p_titulo_prom VARCHAR(100),
    _p_fecha_ini_prom TIMESTAMP,
    _p_fecha_fin_prom TIMESTAMP,
    _p_descr_prom VARCHAR(300),
    _p_banner_prom BYTEA DEFAULT NULL,
    _p_descuento_prom NUMERIC(5,2),
    _p_cod_cat INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    _p_duracion_prom INTEGER;
    cod_prom_nuevo INTEGER;
BEGIN
    _p_duracion_prom:= EXTRACT(DAY FROM (p_fecha_fin_prom - p_fecha_ini_prom));

    INSERT INTO promocion (
        titulo_prom,
        fecha_ini_prom,
        duracion_prom,
        fecha_fin_prom,
        descr_prom,
        banner_prom,
        descuento_prom
    ) VALUES (
        _p_titulo_prom,
        _p_fecha_ini_prom,
        _p_duracion_prom,
        _p_fecha_fin_prom,
        _p_descr_prom,
        _p_banner_prom,
        _p_descuento_prom
    )
    RETURNING cod_prom INTO cod_prom_nuevo;

    INSERT INTO PROMOCION_CATEGORIA (cod_cat, cod_prom)
    VALUES (p_cod_cat, cod_prom_nuevo);

END;
$$;

-- =========================================
-- 18) OBTENER PROMOCIONES ACTIVAS (PRODUCTOS + SERVICIOS)
-- =========================================

-- Descripción:
-- Esta función retorna todas las promociones activas, tanto de productos como de servicios.
-- Realiza una unión entre las tablas PROMOCION_PRODUCTO y PROMOCION_SERVICIO para consolidar los datos.
-- Devuelve información general de la promoción junto con el tipo de asociado (producto o servicio), su ID y nombre.
CREATE OR REPLACE FUNCTION sp_getPromocionesActivas()
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
        pr.cod_prod, prod.nom_prod
    FROM PROMOCION p
    JOIN PROMOCION_PRODUCTO pr ON p.cod_prom = pr.cod_prom
    JOIN PRODUCTO prod ON pr.cod_prod = prod.id_prod

    UNION ALL

    SELECT
        p.cod_prom, p.titulo_prom, p.fecha_ini_prom, p.duracion_prom, p.fecha_fin_prom,
        p.descr_prom, p.banner_prom, p.descuento_prom,
        ps.cod_serv, s.nom_serv 
    FROM PROMOCION p
    JOIN PROMOCION_SERVICIO ps ON p.cod_prom = ps.cod_prom
    JOIN SERVICIO s ON ps.cod_serv = s.cod_serv
$$;

-- =========================================
-- 19) REGISTRAR EVENTO
-- =========================================

-- Descripción:
-- Esta función registra un nuevo evento en la tabla EVENTO.
-- Calcula automáticamente la duración del evento en días a partir de la fecha de inicio y finalización.
-- También registra la fecha actual como fecha de creación del evento.
CREATE OR REPLACE FUNCTION sp_registrarEvento(
    _p_cod_org INT,
    _p_titulo_evento VARCHAR(100),
    _p_descripcion_evento VARCHAR(200),
    _p_fecha_inicio_evento DATE,
    _p_fecha_finalizacion_evento DATE,
    _p_tipo_evento VARCHAR(20)
) RETURNS void LANGUAGE sql AS $$
    INSERT INTO EVENTO(
        cod_org, titulo_evento, descripcion_evento, fecha_registro_evento,
        fecha_inicio_evento, fecha_finalizacion_evento, duracion_evento, tipo_evento
    )
    VALUES(
        _p_cod_org, _p_titulo_evento, _p_descripcion_evento, NOW(),
        _p_fecha_inicio_evento, _p_fecha_finalizacion_evento,
        CAST(DATE_PART('day', _p_fecha_finalizacion_evento::timestamp - _p_fecha_inicio_evento::timestamp) AS INTEGER),
        _p_tipo_evento
    );
$$;

-- =========================================
-- 20) REGISTRAR PARTICIPACIÓN EN EVENTO
-- =========================================

-- Descripción:
-- Esta función registra la participación de un usuario en un evento determinado.
-- Inserta un nuevo registro en la tabla USUARIO_EVENTO, asociando el código del evento con el código del usuario.

-- Parámetros:
-- _p_cod_us       → Código del usuario que participa
-- _p_cod_evento   → Código del evento al que se inscribe

-- Retorno:
-- VOID → No retorna ningún valor

CREATE OR REPLACE FUNCTION sp_participarEvento(
    _p_cod_us INT,
    _p_cod_evento INT
) RETURNS void LANGUAGE sql AS $$
    INSERT INTO USUARIO_EVENTO(cod_evento, cod_us)
    VALUES(_p_cod_evento, _p_cod_us);
$$;


-- =========================================
-- 21) HISTORIAL DE TRANSACCIONES DE USUARIO
-- =========================================

-- Descripción:
-- Esta función retorna todas las transacciones en las que ha participado un usuario específico.
-- Filtra los registros de la tabla TRANSACCION donde el usuario aparece como origen o destino.
-- Devuelve el conjunto completo de columnas definidas en la tabla TRANSACCION.
CREATE OR REPLACE FUNCTION sp_historiaTransaccionesUsuario(
    _p_cod_us INT
) RETURNS SETOF TRANSACCION LANGUAGE sql AS $$
    SELECT *
    FROM TRANSACCION
    WHERE cod_us_destino = _p_cod_us
       OR cod_us_origen  = _p_cod_us
$$;

-- =========================================
-- 22) LISTAR EVENTOS ACTIVOS
-- =========================================

-- Descripción:
-- Esta función retorna todos los eventos que se encuentran actualmente activos.
-- Filtra los registros de la tabla EVENTO cuyo estado sea 'vigente'.
-- Devuelve el conjunto completo de columnas definidas en la tabla EVENTO.
CREATE OR REPLACE FUNCTION sp_getEventosActivos()
RETURNS SETOF EVENTO LANGUAGE sql AS $$
    SELECT *
    FROM EVENTO
    WHERE estado_evento = 'vigente'
$$;


-- =========================================
-- 23) ACTUALIZAR EVENTO
-- =========================================

-- Descripción:
-- Este procedimiento actualiza los datos de un evento existente en la tabla EVENTO.
-- Permite modificar el título, descripción, fechas, banner y tipo del evento.
-- Si alguno de los parámetros es NULL, se conserva el valor actual en la base de datos.
CREATE OR REPLACE PROCEDURE sp_actualizarEvento(
  _p_cod_evento INTEGER,
  _p_titulo_evento VARCHAR(100) DEFAULT NULL,
  _p_descripcion_evento VARCHAR(200) DEFAULT NULL,
  _p_fecha_inicio_evento DATE DEFAULT NULL,
  _p_fecha_finalizacion_evento DATE DEFAULT NULL,
  _p_banner_evento BYTEA DEFAULT NULL,
  _p_tipo_evento VARCHAR(20) DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE evento
  SET
    titulo_evento = COALESCE(_p_titulo_evento, titulo_evento),
    descripcion_evento = COALESCE(_p_descripcion_evento, descripcion_evento),
    fecha_inicio_evento = COALESCE(_p_fecha_inicio_evento, fecha_inicio_evento),
    fecha_finalizacion_evento = COALESCE(_p_fecha_finalizacion_evento, fecha_finalizacion_evento),
    banner_evento = COALESCE(_p_banner_evento, banner_evento),
    tipo_evento = COALESCE(_p_tipo_evento, tipo_evento)
  WHERE cod_evento = _p_cod_evento;
END;
$$;

-- =========================================
-- 24) OBTENER HISTORIAL DE ACCESOS DE UN USUARIO
-- =========================================

-- Descripción:
-- Esta función retorna el historial de accesos registrados por un usuario específico.
-- Extrae los datos de la tabla ACCESO, ordenados de forma descendente por fecha.
-- Devuelve información sobre cada intento de acceso, incluyendo estado y contraseña utilizada.
CREATE OR REPLACE FUNCTION sp_getHistorialAccesosUsuario(p_cod_us INTEGER)
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
    WHERE a.cod_us = p_cod_us
    ORDER BY a.fecha_acc DESC;
END;
$$;

-- =========================================
-- 25) OBTENER PUBLICACIONES DE UN USUARIO
-- =========================================

-- Descripción:
-- Esta función retorna todas las publicaciones realizadas por un usuario específico.
-- Incluye publicaciones de productos y servicios, combinando los datos mediante LEFT JOIN.
-- Devuelve información general de la publicación junto con los detalles del producto o servicio asociado.
CREATE OR REPLACE FUNCTION sp_getPublicacionesUsuario(
    _p_cod_usuario INT
) RETURNS TABLE(
    cod_pub INT,
    cod_us INT,
    fecha_ini_pub DATE,
    fecha_fin_pub DATE,
    foto_pub BYTEA,
    calif_pond_pub DECIMAL(3,2),
    impacto_amb_pub DECIMAL(10,2),
    cod_prod INT,
    cant_prod INT,
    unidad_medida VARCHAR,
    cod_serv INT,
    hrs_ini_dia_serv TIME,
    hrs_fin_dia_serv TIME
) LANGUAGE sql AS $$
    SELECT
        p.cod_pub, p.cod_us, p.fecha_ini_pub, p.fecha_fin_pub, p.foto_pub,
        p.calif_pond_pub, p.impacto_amb_pub,
        pp.cod_prod, pp.cant_prod, pp.unidad_medida,
        ps.cod_serv, ps.hrs_ini_dia_serv, ps.hrs_fin_dia_serv
    FROM PUBLICACION p
    LEFT JOIN PUBLICACION_PRODUCTO pp ON p.cod_pub = pp.cod_pub
    LEFT JOIN PUBLICACION_SERVICIO ps ON p.cod_pub = ps.cod_pub
    WHERE p.cod_us = _p_cod_usuario
    ORDER BY p.fecha_ini_pub DESC
$$;

-- =========================================
-- 26) OBTENER PUBLICACIONES DE SERVICIO POR CATEGORÍA
-- =========================================

-- Descripción:
-- Esta función retorna todas las publicaciones de servicios asociadas a una categoría específica.
-- Realiza un filtrado por código de categoría y tipo de categoría igual a 'servicio'.
-- Devuelve información general de la publicación, detalles del servicio y datos del usuario que publicó
CREATE OR REPLACE FUNCTION sp_getPublicacionesServicioporCategoria(_p_cod_cat INT)
RETURNS TABLE(
    cod_pub INT,
    foto_pub BYTEA,
    calif_pond_pub DECIMAL(3,2),
    impacto_amb_pub DECIMAL(10,2),
    cod_serv INT,
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
        s.cod_serv, s.nom_serv, s.desc_serv, s.precio_serv, s.duracion_serv,
        u.handle_name, u.foto_us, ps.hrs_ini_dia_serv, ps.hrs_fin_dia_serv
    FROM PUBLICACION p
    JOIN PUBLICACION_SERVICIO ps ON p.cod_pub = ps.cod_pub
    JOIN SERVICIO s ON ps.cod_serv = s.cod_serv
    JOIN CATEGORIA c ON s.cod_cat = c.cod_cat
    JOIN USUARIO u ON p.cod_us = u.cod_us
    WHERE c.cod_cat = _p_cod_cat
      AND LOWER(c.tipo_cat) = 'servicio'
$$;

-- =========================================
-- 27) OBTENER PUBLICACIONES DE PRODUCTO POR SUBCATEGORÍA
-- ========================================

-- Descripción:
-- Esta función retorna todas las publicaciones de productos asociadas a una subcategoría específica.
-- Realiza una unión entre las tablas PUBLICACION, PRODUCTO, PUBLICACION_PRODUCTO, SUBCATEGORIA_PRODUCTO y USUARIO.
-- Devuelve información general de la publicación, detalles del producto y datos del usuario que publicó.
CREATE OR REPLACE FUNCTION sp_getPublicacionesProductoporSubcategoria(_p_cod_subcat_prod INT)
RETURNS TABLE(
    cod_pub INT,
    foto_pub BYTEA,
    calif_pond_pub DECIMAL(3,2),
    impacto_amb_pub DECIMAL(10,2),
    cod_prod INT,
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
        pr.cod_prod, pr.nom_prod, pr.desc_prod, pr.precio_prod,
        ppr.cant_prod, ppr.unidad_medida,
        u.handle_name, u.foto_us
    FROM PUBLICACION p
    JOIN USUARIO u ON u.cod_us = p.cod_us
    JOIN PUBLICACION_PRODUCTO ppr ON ppr.cod_pub = p.cod_pub
    JOIN PRODUCTO pr ON pr.cod_prod = ppr.cod_prod
    JOIN SUBCATEGORIA_PRODUCTO sub ON sub.cod_subcat_prod = pr.cod_subcat_prod
    WHERE sub.cod_subcat_prod = _p_cod_subcat_prod
$$;

-- =========================================
-- 28) CALCULAR CO2 EQUIVALENTE DE UN PRODUCTO
-- =========================================

-- Descripción:
-- Esta función calcula la cantidad total de CO2 equivalente generada por un producto, según su composición de materiales.
-- Utiliza factores de conversión definidos en la tabla EQUIVALENCIA_CO2 para transformar unidades a kilogramos de CO2.
-- Si no existe una equivalencia específica, se utiliza el factor de CO2 directo del material.
-- Muestra un mensaje por cada material indicando su contribución individual al total de CO2.
CREATE OR REPLACE FUNCTION sp_calcularCO2ProductoEquivalencia(
    _p_cod_prod INTEGER,
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
        SELECT mp.cod_mat, m.factor_co2, m.nom_mat
        FROM MATERIAL_PRODUCTO mp
        JOIN MATERIAL m ON mp.cod_mat = m.cod_mat
        WHERE mp.cod_prod = _p_cod_prod
    LOOP
        SELECT factor_conversion INTO _factor_equiv
        FROM EQUIVALENCIA_CO2
        WHERE cod_mat = _material_record.cod_mat 
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

-- =========================================
-- 29) REGISTRAR EQUIVALENCIA DE CO₂ PARA UN MATERIAL
-- =========================================

-- Descripción:
-- Esta función registra una nueva equivalencia de conversión de una unidad de origen a kilogramos de CO₂
-- para un material específico. Verifica que el material exista antes de insertar el registro.
-- Devuelve el ID generado de la equivalencia registrada.
CREATE OR REPLACE FUNCTION sp_registrarEquivalencia(
    _p_cod_mat INTEGER,
    _p_unidad_origen VARCHAR(20),
    _p_factor_conversion DECIMAL(12,6),
    _p_descripcion VARCHAR(200) DEFAULT NULL,
    _p_fuente_datos VARCHAR(200) DEFAULT NULL
) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
    _nuevo_id INTEGER;
    _material_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM MATERIAL WHERE cod_mat = _p_cod_mat) 
    INTO _material_exists;
    
    IF NOT _material_exists THEN
        RAISE EXCEPTION 'El material con ID % no existe', _p_cod_mat;
    END IF;
    
    INSERT INTO EQUIVALENCIA_CO2 (
        cod_mat, unidad_origen, unidad_destino, factor_conversion, 
        descripcion, fuente_datos, fecha_actualizacion
    ) VALUES (
        _p_cod_mat, _p_unidad_origen, 'kg_co2', _p_factor_conversion,
        _p_descripcion, _p_fuente_datos, NOW()
    )
    RETURNING cod_equiv INTO _nuevo_id;
    
    RETURN _nuevo_id;
END;
$$;

-- =========================================
-- 30) ACTUALIZAR HUELLA DE CO₂ DE UN USUARIO
-- =========================================

-- Descripción:
-- Esta función calcula y actualiza la huella de carbono total de un usuario en función de sus publicaciones activas.
-- Para cada publicación de producto, se calcula el CO₂ equivalente usando la función `sp_calcularCO2ProductoEquivalencia`.
-- Las publicaciones de servicios se consideran con impacto ambiental nulo.
-- Actualiza el campo `impacto_amb_pub` en cada publicación y el campo `huella_co2` en el perfil del usuario.
CREATE OR REPLACE FUNCTION sp_actualizarHuellaUsuario(
    _p_cod_us INTEGER
) RETURNS DECIMAL(10,2) LANGUAGE plpgsql AS $$
DECLARE
    _nueva_huella DECIMAL(10,2) := 0;
    _publicacion_record RECORD;
    _co2_publicacion DECIMAL(10,2);
BEGIN
    FOR _publicacion_record IN 
        SELECT p.cod_pub, pp.cod_prod, pp.cant_prod, pp.unidad_medida,
               pr.peso_prod, ps.cod_serv
        FROM PUBLICACION p
        LEFT JOIN PUBLICACION_PRODUCTO pp ON p.cod_pub = pp.cod_pub
        LEFT JOIN PRODUCTO pr ON pp.cod_prod = pr.cod_prod
        LEFT JOIN PUBLICACION_SERVICIO ps ON p.cod_pub = ps.cod_pub
        WHERE p.cod_us = _p_cod_us 
          AND p.fecha_fin_pub >= CURRENT_DATE
    LOOP
        IF _publicacion_record.cod_prod IS NOT NULL THEN
            _co2_publicacion := sp_calcularCO2ProductoEquivalencia(
                _publicacion_record.cod_prod,
                _publicacion_record.cant_prod,
                COALESCE(_publicacion_record.unidad_medida, 'kg')
            );
        ELSIF _publicacion_record.cod_serv IS NOT NULL THEN
            _co2_publicacion := 0;
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
    WHERE cod_us = _p_cod_us;
    
    RETURN _nueva_huella;
END;
$$;

-- =========================================
-- 31) OBTENER EQUIVALENCIAS DE CO₂ PARA UN MATERIAL
-- =========================================

-- Descripción:
-- Esta función retorna todas las equivalencias de conversión registradas para un material específico.
-- Extrae los datos desde la tabla EQUIVALENCIA_CO2 y los complementa con el nombre del material desde la tabla MATERIAL.
-- Ordena los resultados por unidad de origen para facilitar la lectura.
CREATE OR REPLACE FUNCTION sp_getEquivalenciasMaterial(
    _p_cod_mat INTEGER
) RETURNS TABLE(
    cod_equiv INTEGER,
    unidad_origen VARCHAR,
    factor_conversion DECIMAL,
    descripcion VARCHAR,
    fecha_actualizacion TIMESTAMP,
    fuente_datos VARCHAR,
    nom_mat VARCHAR
) LANGUAGE sql AS $$
    SELECT 
        e.cod_equiv, e.unidad_origen, e.factor_conversion,
        e.descripcion, e.fecha_actualizacion, e.fuente_datos,
        m.nom_mat
    FROM EQUIVALENCIA_CO2 e
    JOIN MATERIAL m ON e.cod_mat = m.cod_mat
    WHERE e.cod_mat = _p_cod_mat
    ORDER BY e.unidad_origen;
$$;

-- =========================================
-- 32) CONVERTIR UNIDAD DE CO₂ PARA UN MATERIAL
-- =========================================

-- Descripción:
-- Esta función convierte una cantidad de material desde una unidad de origen a una unidad destino,
-- utilizando los factores de conversión registrados en la tabla EQUIVALENCIA_CO2.
-- Si la unidad destino es 'kg_co2', se realiza una conversión directa.
-- Si se desea convertir entre unidades distintas (ambas hacia 'kg_co2'), se aplica una relación proporcional.
CREATE OR REPLACE FUNCTION sp_convertirUnidadCO2(
    _p_cod_mat INTEGER,
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
    WHERE cod_mat = _p_cod_mat 
      AND unidad_origen = _p_unidad_origen
      AND unidad_destino = 'kg_co2';
    
    SELECT factor_conversion INTO _factor_destino
    FROM EQUIVALENCIA_CO2
    WHERE cod_mat = _p_cod_mat 
      AND unidad_origen = _p_unidad_destino
      AND unidad_destino = 'kg_co2';
    
    IF _factor_origen IS NULL THEN
        RAISE EXCEPTION 'No existe equivalencia para % en el material ID %', 
            _p_unidad_origen, _p_cod_mat;
    END IF;
    
    IF _factor_destino IS NULL AND _p_unidad_destino != 'kg_co2' THEN
        RAISE EXCEPTION 'No existe equivalencia para % en el material ID %', 
            _p_unidad_destino, _p_cod_mat;
    END IF;
    
    IF _p_unidad_destino = 'kg_co2' THEN
        _resultado := _p_cantidad * _factor_origen;
    ELSE
        _resultado := (_p_cantidad * _factor_origen) / _factor_destino;
    END IF;
    
    RETURN _resultado;
END;
$$;

-- =========================================
-- 33) REPORTE DE IMPACTO AMBIENTAL POR USUARIO
-- =========================================

-- Descripción:
-- Esta función genera un reporte consolidado del impacto ambiental de todas las publicaciones realizadas por un usuario.
-- Incluye tanto productos como servicios, diferenciando el tipo de publicación.
-- Devuelve el nombre del ítem, cantidad, unidad, CO₂ generado y fecha de publicación.
CREATE OR REPLACE FUNCTION sp_reporte_impacto_ambiental(
    _p_cod_us INTEGER
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
    JOIN PRODUCTO pr ON pp.cod_prod = pr.cod_prod
    WHERE p.cod_us = _p_cod_us
    
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
    JOIN SERVICIO s ON ps.cod_serv = s.cod_serv
    WHERE p.cod_us = _p_cod_us
    ORDER BY fecha_publicacion DESC;
$$;

-- =========================================
-- 34) OBTENER RANKING DE USUARIOS POR HUELLA DE CO₂
-- =========================================

-- Descripción:
-- Esta función genera un ranking de usuarios activos ordenados por menor huella de carbono registrada.
-- Utiliza la tabla DETALLE_USUARIO para obtener la huella y cantidad de ventas, y aplica DENSE_RANK para asignar posiciones.
-- Devuelve los datos personales del usuario junto con su posición en el ranking.
CREATE OR REPLACE FUNCTION sp_getRankingHuellaCO2(_p_top_n INTEGER DEFAULT 10)
RETURNS TABLE (
    cod_us INTEGER,
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
        u.cod_us,
        u.handle_name,
        u.nom_us,
        u.foto_us,
        du.huella_co2,
        du.cant_ventas,
        DENSE_RANK() OVER (ORDER BY du.huella_co2 ASC) AS posicion_ranking
    FROM USUARIO u
    INNER JOIN DETALLE_USUARIO du ON u.cod_us = du.cod_us
    WHERE u.estado_us = 'activo'
      AND du.huella_co2 > 0
    ORDER BY du.huella_co2 ASC
    LIMIT p_top_n;
END;
$$;

-- =========================================
-- 35) OBTENER LOGROS DE UN USUARIO
-- =========================================

-- Descripción:
-- Esta función retorna el listado de logros disponibles para un usuario, indicando si han sido obtenidos o no.
-- Incluye información del logro, su progreso actual, y la recompensa asociada si existe.
-- Ordena los logros mostrando primero los obtenidos, seguidos por los no obtenidos.
CREATE OR REPLACE FUNCTION sp_getLogrosUsuario(_p_cod_us INTEGER)
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
    LEFT JOIN USUARIO_LOGRO ul ON l.cod_logro = ul.cod_logro AND ul.cod_us = _p_cod_us
    LEFT JOIN RECOMPENSA_LOGRO rl ON l.cod_logro = rl.cod_logro
    LEFT JOIN RECOMPENSA r ON rl.cod_rec = r.cod_rec
    ORDER BY 
        CASE WHEN ul.fechaObtencion_logro IS NOT NULL THEN 1 ELSE 2 END,
        ul.fechaObtencion_logro DESC;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 36) CAMBIAR CRÉDITOS A MONEDA LOCAL
-- =========================================

-- Descripción:
-- Este procedimiento realiza la conversión de créditos a bolivianos utilizando un factor fijo.
-- Calcula el monto equivalente y el nuevo saldo de la billetera del usuario.
-- Actualiza el nuevo saldo en la billetera del usuario
CREATE OR REPLACE FUNCTION sp_cambiarCreditos(
  _p_montoCambiar DECIMAL(12,2),
  _p_cod_bill INTEGER,
  _p_cod_us INTEGER
)
RETURNS TABLE(
    mensaje TEXT,
    monto_convertido DECIMAL(12,2),
    nuevo_saldo_creditos DECIMAL(12,2)
) 
LANGUAGE plpgsql
AS $$
DECLARE 
    cambio DECIMAL(10,4) := 0.02857; 
    monto_bol DECIMAL(12,2);
    saldo_actualizado DECIMAL(12,2);
BEGIN
    monto_bol := _p_montoCambiar * cambio;
    monto_bol := ROUND(monto_bol, 2);

    SELECT saldo_actual - _p_montoCambiar INTO saldo_actualizado
    FROM BILLETERA 
    WHERE cod_bill = _p_cod_bill;

    UPDATE BILLETERA 
    SET saldo_actual = saldo_actualizado
    WHERE cod_bill = _p_cod_bill;
END;
$$;
