USE MRRRDB;
GO
--Procedimientos Almacenados

--p.a. Registrar usuario
CREATE PROCEDURE sp_registrarUsuario
    @p_cod_rol INT,
	@p_ci VARCHAR(20),
	@p_nom_us VARCHAR(100),
	@p_handle_name VARCHAR(50),
	@p_ap_pat_us VARCHAR(50),
	@p_ap_mat_us VARCHAR(50),
	@p_contra_us VARCHAR(100),
	@p_fecha_nacimiento DATE,
	@p_sexo CHAR(1),
	@p_estado_us VARCHAR(20),
	@p_correo_us VARCHAR(100),
	@p_telefono_us VARCHAR(20),
	@p_foto_us VARBINARY(MAX)
AS BEGIN
  INSERT INTO USUARIO (
		cod_rol,
		ci,
		nom_us,
		handle_name,
		ap_pat_us,
		ap_mat_us,
		contra_us,
		fecha_nacimiento,
		sexo,
		estado_us,
		correo_us,
		telefono_us,
		foto_us
	)
	VALUES (
		@p_cod_rol,
		@p_ci,
		@p_nom_us,
		@p_handle_name,
		@p_ap_pat_us,
		@p_ap_mat_us,
		@p_contra_us,
		@p_fecha_nacimiento,
		@p_sexo,
		@p_estado_us,
		@p_correo_us,
		@p_telefono_us,
		@p_foto_us
	);
END;
GO


--Verificar Login de usuariO
CREATE PROCEDURE sp_verificarUsuarioLogin 
    @p_handle_name VARCHAR(100),
    @p_contra_us VARCHAR(100),
    @p_res_login BIT OUTPUT
AS BEGIN
    IF EXISTS (
        SELECT 1
        FROM USUARIO
        WHERE handle_name = @p_handle_name 
          AND contra_us = @p_contra_us
    )
    BEGIN
        SET @p_res_login = 1;
    END
    ELSE
    BEGIN
        SET @p_res_login = 0;
    END
END;
GO

--Actualizar usuario(ES LO UNICO QUE PUEDE ACTUALIZAR??)
CREATE PROCEDURE sp_actualizarUsuario
    @p_id_us INTEGER,
	@p_nom_us VARCHAR(100)= NULL,
	@p_correo_us VARCHAR(100)=NULL,
	@p_telefono_us VARCHAR(20)=NULL
AS BEGIN
 UPDATE USUARIO
 SET 
   nom_us=ISNULL(@p_nom_us,nom_us),	
   correo_us=ISNULL(@p_correo_us,correo_us),
   telefono_us=ISNULL(@p_telefono_us,telefono_us);
END;
GO

   
 --Registrar una Promocion
 CREATE PROCEDURE sp_registrarPromocion 
     @p_titulo_prom VARCHAR(100),
	 @p_fecha_ini_prom DATETIME,
	 @p_fecha_fin_prom DATETIME,
	 @p_descr_prom VARCHAR(100),
	 @p_banner_prom VARBINARY(MAX),
	 @p_descuento_prom DECIMAL(5,2)
AS BEGIN
 INSERT INTO PROMOCION (
	titulo_prom,
	fecha_ini_prom,
	duracion_prom,
	fecha_fin_prom ,
	descr_prom,
	banner_prom ,
	descuento_prom
 ) VALUES (
     @p_titulo_prom,
	 @p_fecha_ini_prom,
	 DATEDIFF(DAY, @p_fecha_ini_prom, @p_fecha_fin_prom),
	 @p_fecha_fin_prom,
	 @p_descr_prom,
	 @p_banner_prom,
	 @p_descuento_prom
 )
 END;
 GO

 --obtener promciones activas
 CREATE PROCEDURE sp_getPromocionesActivas 
 AS BEGIN 
   SELECT 
    p.cod_prom,
    p.titulo_prom,
    p.fecha_ini_prom,
    p.duracion_prom,
    p.fecha_fin_prom,
    p.descr_prom,
    p.banner_prom,
    p.descuento_prom,
    pr.id_prod   AS id_asociado,
    prod.nom_prod AS nombre_asociado,
    'PRODUCTO'   AS tipo_asociado
	FROM PROMOCION p
    INNER JOIN PROMOCION_PRODUCTO pr
        ON p.cod_prom = pr.cod_prom
    INNER JOIN PRODUCTO prod
        ON pr.id_prod = prod.id_prod

  UNION ALL

	SELECT 
		p.cod_prom,
		p.titulo_prom,
		p.fecha_ini_prom,
		p.duracion_prom,
		p.fecha_fin_prom,
		p.descr_prom,
		p.banner_prom,
		p.descuento_prom,
		ps.id_serv   AS id_asociado,
		s.nom_serv   AS nombre_asociado,
		'SERVICIO'   AS tipo_asociado
	FROM PROMOCION p
	INNER JOIN PROMOCION_SERVICIO ps
		ON p.cod_prom = PS.cod_prom
	INNER JOIN SERVICIO s
		ON ps.id_serv = s.id_serv;
END;
GO

--OBTENER la publicacon de usuario
CREATE PROCEDURE sp_getPublicacionesUsuario
    @p_id_usuario INT
AS BEGIN
    SELECT 
        p.cod_pub,
        p.id_us,
        p.fecha_ini_pub,
        p.fecha_fin_pub,
        p.foto_pub,
        p.calif_pond_pub,
        p.impacto_amb_pub,
        pp.id_prod,
        pp.cant_prod,
        pp.unidad_medida,
        ps.id_serv,
        ps.hrs_ini_dia_serv,
        ps.hrs_fin_dia_serv
    FROM PUBLICACION p
    LEFT JOIN PUBLICACION_PRODUCTO pp ON p.cod_pub = pp.cod_pub
    LEFT JOIN PUBLICACION_SERVICIO ps ON p.cod_pub = ps.cod_pub
    WHERE p.id_us = @p_id_usuario
    ORDER BY p.fecha_ini_pub DESC;
END;
GO

--Registrar evento
CREATE PROCEDURE  sp_registrarEvento
	 @p_id_org INTEGER, 
	 @p_titulo_evento VARCHAR(100), 
	 @p_descripcion_evento VARCHAR(200), 
	 @p_fecha_inicio_evento DATE, 
	 @p_fecha_finalizacion_evento DATE,
	 @p_tipo_evento VARCHAR(20)
AS BEGIN
INSERT INTO EVENTO (
	id_org, 
	titulo_evento,
	descripcion_evento,
	fecha_registro_evento,
	fecha_inicio_evento,
	fecha_finalizacion_evento,
	duracion_evento,
	tipo_evento
)
VALUES(
     @p_id_org, 
	 @p_titulo_evento, 
	 @p_descripcion_evento ,
	 GETDATE(),
	 @p_fecha_inicio_evento , 
	 @p_fecha_finalizacion_evento,
	 DATEDIFF(DAY,@p_fecha_inicio_evento,@p_fecha_finalizacion_evento),
	 @p_tipo_evento
)
END;
GO

--Quizas añadir sp_actualizarEvento

--Registrar usuario en evento(QUIZAS considerar un if para verificar si el usuairo ya esta inscrito, y un nuevo
--   para registrar la fecha de inscripcion))
CREATE PROCEDURE sp_participarEvento
    @p_id_us INTEGER,
	@p_cod_evento INTEGER
AS BEGIN
  INSERT INTO USUARIO_EVENTO (cod_evento, id_us)
   VALUES (@p_cod_evento, @p_id_us)
END;
GO

--Consultar transacciones de un usuario
CREATE PROCEDURE sp_historiaTransaccionesUsuario
  @p_id_us INTEGER
AS BEGIN
 SELECT * FROM TRANSACCION 
 WHERE id_us_destino= @p_id_us
    OR id_us_origen=@p_id_us
END;
GO

--Listar los eventos activos
CREATE PROCEDURE sp_getEventosActivos
AS BEGIN
  SELECT * FROM EVENTO
  WHERE estado_evento='activo'
END;
GO

--Listar Categorias
CREATE PROCEDURE sp_getCategoriasProducto
AS BEGIN 
  SELECT
     c.cod_cat,
	 c.nom_cat
  FROM CATEGORIA c
  WHERE c.tipo_cat = 'producto'
  ORDER BY c.cod_cat;
  END;
  GO

  CREATE PROCEDURE sp_getCageoriasServicio
  AS BEGIN
    SELECT
	 c.cod_cat,
	 c.nom_cat
	FROM CATEGORIA c
	WHERE c.tipo_cat = 'servicio'
	ORDER BY c.cod_cat;
END;
GO

--ver Categoria seleccionada
CREATE PROCEDURE sp_verCategoria
  @p_cod_cat INTEGER
AS BEGIN 
  SELECT 
    c.cod_cat,
	c.nom_cat,
	c.descr_cat,
	c.imagen_repr,
	c.tipo_cat
  FROM CATEGORIA c
  WHERE c.cod_cat=@p_cod_cat;
END;
GO

--Actualizar Categoria
CREATE PROCEDURE sp_actualizarCategoria
    @p_cod_cat INTEGER,
	@p_nom_cat VARCHAR(100)= NULL,
	@p_descr_cat VARCHAR(200)=NULL,
	@p_imagen_repr VARCHAR(200)=NULL,
	@p_tipo_cat VARCHAR(20)
AS BEGIN
 UPDATE CATEGORIA
 SET 
   nom_cat=ISNULL(@p_nom_cat,nom_cat),	
   descr_cat=ISNULL(@p_descr_cat,descr_cat),
   imagen_repr=ISNULL(@p_imagen_repr,imagen_repr),
   tipo_cat=ISNULL(@p_tipo_cat,tipo_cat);
   WHERE cod_cat=@p_cod_cat;
END;
GO

--listar Subcategorias
CREATE PROCEDURE sp_getSubcategorias
AS BEGIN
  SELECT
    sub.cod_subcat_prod,
	sub.nom_subcat_prod,
	sub.cod_cat
  FROM SUBCATEGORIA_PRODUCTO sub
  ORDER BY sub.cod_cat;
END;
GO

--ver Sbcategroia seleccionada
CREATE PROCEDURE sp_verSubcategoria
   @p_cod_subcat_prod INTEGER
AS BEGIN 
 SELECT 
   sub.cod_subcat_prod,
   sub.nom_subcat_prod,
   c.nom_cat,
   sub.descr_subcat_prod,
   sub.imagen_representativa
 FROM SUBCATEGORIA_PRODUCTO sub
 INNER JOIN CATEGORIA c ON c.cod_cat=sub.cod_cat
 WHERE sub.cod_subcat_prod = @p_cod_subcat_prod
END;
GO

--Actualizar Subcategora(VER imagen_representativa si es VARBINARY)
CREATE PROCEDURE sp_actualizarSubcategoria
    @p_cod_subcat_prod INTEGER,
	@p_cod_cat INTEGER,
	@p_nom_subcat_prod VARCHAR(100)=NULL,
	@p_imagen_representativa VARCHAR(200)=NULL,
	@p_descr_subcat_prod VARCHAR(200)=NULL
AS BEGIN
   UPDATE SUBCATEGORIA_PRODUCTO
   SET
     cod_subcat_prod=ISNULL(@p_cod_subcat_prod,cod_subcat_prod),
	 cod_cat=ISNULL(@p_cod_cat,cod_cat),
	 nom_subcat_prod=ISNULL(@p_nom_subcat_prod,nom_subcat_prod),
	 imagen_representativa=ISNNULL(@p_imagen_representativa,imagen_representativa),
	 descr_subcat_prod=ISNULL(@p_descr_subcat_prod,descr_subcat_prod);
	 WHERE cod_subcat_prod=@p_cod_subcat_prod;
END;
GO

--NO quiero hacer lo de transacciones uwu(aunque creo que ya hice una uwunt)

--IMPORTANTE
--en el informe dice -> listar PRODUCTOS/SERVICIOS por categoria NO SERIA PUBLICACION????
--lo mismo con listar PRODUCOTS por subcategoria NO SERIA PUBLICACION?????


--Listar Subcategorias correspondientes a una categoria
CREATE PROCEDURE sp_getSubcategoriasDeCategoria
    @p_cod_cat INTEGER
AS BEGIN 
  SELECT 
    cod_subcat_prod,
    nom_subcat_prod,
	imagen_representativa
  FROM SUBCATEGORIA_PRODUCTO 
  WHERE cod_cat=@p_cod_cat;
END;
GO

--Obtener publicaciones de servicios dada una categoria(VER SI NO SE NECSITA MAS CONDICIONALES, FILTROS O CAMPOS QUE SELECCIONAR)
CREATE PROCEDURE sp_getPublicacionesServicioPorCategoria
    @p_cod_cat INTEGER
AS BEGIN
    SELECT 
        p.cod_pub,
        p.foto_pub,
        p.calif_pond_pub,
        p.impacto_amb_pub,
        s.id_serv,
        s.nom_serv,
        s.desc_serv,
        s.precio_serv,
        s.duracion_serv,
        u.handle_name,
        u.foto_us,
        ps.hrs_ini_dia_serv,
        ps.hrs_fin_dia_serv
    FROM PUBLICACION p
    INNER JOIN PUBLICACION_SERVICIO ps ON p.cod_pub = ps.cod_pub
    INNER JOIN SERVICIO s ON ps.id_serv = s.id_serv
    INNER JOIN CATEGORIA c ON s.cod_cat = c.cod_cat
    INNER JOIN USUARIO u ON p.id_us = u.id_us
    WHERE c.cod_cat = @p_cod_cat
      AND c.tipo_cat = 'servicio'
END;
GO

--Obtener publicaciones de productos dada una subcategoria(CHUCHA CREO QUE LE FALTA CALIFICACIONES BORREN ESA MAMADA DE LA BD)
CREATE PROCEDURE sp_getPublicacionesProductoPorSubcategoria
    @p_cod_subcat_prod
AS BEGIN 
    SELECT
		p.cod_pub,
		p.foto_pub,
		p.calif_pond_pub,
		p.impacto_amb_pub,
		pr.id_prod,
		pr.nom_prod,
		pr.desc_prod,
		pr.precio_prod,
		ppr.cant_prod,
		ppr.unidad_medida,
		u.handle_name,
		u.foto_us
	FROM PUBLICACION p
	INNER JOIN USUARIO u ON u.id_us=p.id_us
	INNER JOIN PUBLICACION_PRODUCTO ppr ON  ppr.cod_pub=p.cod_pub
	INNER JOIN PRODUCTO pr ON pr.id_prod=ppr.id_prod
	INNER JOIN SUBCATEGORIA_PRODUCTO sub ON sub.cod_subcat_prod = pr.cod_subcat_prod
	WHERE sub.cod_subcat_prod = @p_cod_subcat_prod
END;
GO
      










