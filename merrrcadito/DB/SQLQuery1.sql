CREATE DATABASE MRRRDATABASE;

USE MRRRDATABASE;


--PERMISOS DE USUARIO PARA ACCESO A LA BD
--CREATE LOGIN Administrador WITH PASSWORD='esnupi988';
--CREATE USER Administrador FOR LOGIN Administrador;

--Publicacion A: calificacion de 3.3 estrellas por el usuario 1.
--Publicacion A: calificacion de 4.1 estrellas por el usuario 4.
--Publicacion B: calificaicon de 2.9 estrellas por el usuario 1.

--Publicacion A: calificacion prom: x
--Publicacion B: calificacion prom: y

CREATE TABLE PUBLICACION_PRODUCTO(
	cod_pub INTEGER,
	id_prod INTEGER,
	cant_prod INTEGER NOT NULL DEFAULT(0),
	unidad_medida VARCHAR(20),
	PRIMARY KEY(cod_pub, id_prod),
	FOREIGN KEY (cod_pub) REFERENCES PUBLICACION (cod_pub),
	FOREIGN KEY (id_prod) REFERENCES PRODUCTO (id_prod)
);

CREATE TABLE ORGANIZACION(
	id_org INTEGER IDENTITY(1,1) PRIMARY KEY,
	nom_com_org VARCHAR(100) NOT NULL,
	nom_legal_org VARCHAR(150) UNIQUE NOT NULL,
	tipo_org VARCHAR(50) NOT NULL,
	rubro VARCHAR(100) NOT NULL,
	cif VARCHAR(30) UNIQUE NOT NULL,
	correo_org VARCHAR(100) UNIQUE NOT NULL,
	telf_org VARCHAR(20) UNIQUE NOT NULL,
	dir_org VARCHAR(200) NOT NULL,
	fecha_registro_org DATETIME NOT NULL,
	sitio_web VARCHAR(150),
	logo_org VARBINARY(MAX) UNIQUE
);

CREATE TABLE DETALLE_USUARIO(
	id_us INTEGER,
	cant_adv INTEGER NOT NULL DEFAULT(0),
	fecha_registro DATETIME NOT NULL,
	cant_hrs_libres INTEGER NOT NULL DEFAULT(0),
	cant_dias_libres INTEGER NOT NULL DEFAULT(0),
	--hrs_libres INTEGER, --{(09:00 - VIE 22 DIC), (10:00 - VIE 22 DIC)...}
	dias_ocupados INTEGER NOT NULL DEFAULT(0),
	hrs_ocupadas INTEGER NOT NULL DEFAULT(0),
	calif_us DECIMAL(1, 1) NOT NULL DEFAULT(0.0),
	calif_pond_us DECIMAL(1, 1) NOT NULL DEFAULT(0.0),
	cant_ventas INTEGER NOT NULL DEFAULT(0),
	huella_co2 DECIMAL(10, 2) NOT NULL DEFAULT(0.0)
	PRIMARY KEY(id_us),
	FOREIGN KEY (id_us) REFERENCES USUARIO (id_us) 
);

CREATE TABLE DISPONIBILIDAD(
	cod_disp INTEGER IDENTITY(1, 1) PRIMARY KEY,
	id_us INTEGER,
	hora_ini VARCHAR(10) NOT NULL,
	hora_fin VARCHAR(10) NOT NULL,
	fecha_dia DATE NOT NULL,
	FOREIGN KEY (id_us) REFERENCES USUARIO (id_us),
);

CREATE TABLE INTERCAMBIO(
	cod_inter INTEGER IDENTITY(1, 1) PRIMARY KEY,
	id_prod INTEGER,
	id_us_origen INTEGER,
	id_us_destino INTEGER,
	cant_prod INTEGER,
	unidad_medida VARCHAR(20),
	foto_inter VARBINARY(MAX) UNIQUE NOT NULL,
	impacto_amb_inter DECIMAL (10, 2) NOT NULL DEFAULT(0.0),
	FOREIGN KEY (id_prod) REFERENCES PRODUCTO (id_prod),
	FOREIGN KEY (id_us_origen) REFERENCES USUARIO (id_us_origen),
	FOREIGN KEY (id_us_destino) REFERENCES USUARIO (id_us_destino)
);

CREATE TABLE PERTENECE2(
	cod_pub INTEGER,
	cod_logro INTEGER,
	PRIMARY KEY (cod_pub, cod_logro),
	FOREIGN KEY (cod_pub) REFERENCES PUBLICACION (cod_),
	FOREIGN KEY (cod_prom) REFERENCES PROMOCION (cod_prom)
);

CREATE TABLE TIENE(
	cod_pub INTEGER,
	cod_prom INTEGER,
	PRIMARY KEY (cod_pub, cod_prom),
	FOREIGN KEY (cod_pub) REFERENCES PUBLICACION (cod_pub),
	FOREIGN KEY (cod_prom) REFERENCES PROMOCION (cod_prom)
);

CREATE TABLE ROL(
	cod_rol INTEGER IDENTITY(1,1) PRIMARY KEY,
	nom_rol VARCHAR(50) UNIQUE NOT NULL,
	descr_rol VARCHAR(200) 
);

CREATE TABLE PROMOCION(
	cod_prom INTEGER IDENTITY(1,1) PRIMARY KEY,
	titulo_prom VARCHAR(100) UNIQUE NOT NULL,
	fecha_ini_prom DATETIME NOT NULL,
	duracion_prom INTEGER NOT NULL,
	fecha_fin_prom DATETIME NOT NULL,
	descr_prom VARCHAR(300) NOT NULL,
	banner_prom VARBINARY(MAX),
	descuento_prom DECIMAL(5,2) NOT NULL DEFAULT(0.0)
);

CREATE TABLE PROMOCION_PRODUCTO(
	id_prod INTEGER,
	cod_prom INTEGER,
	PRIMARY KEY (id_prod, cod_prom),
	FOREIGN KEY (id_prod) REFERENCES PRODUCTO (id_prod),
	FOREIGN KEY (cod_prom) REFERENCES PROMOCION (cod_prom)
);

CREATE TABLE PRODUCTO(
	id_prod INTEGER IDENTITY(1, 1) PRIMARY KEY,
	cod_subcat_producto INTEGER,
	nom_prod VARCHAR(100) NOT NULL,
	peso_prod DECIMAL(10, 2) NOT NULL DEFAULT(0.0),
	calidad_prod VARCHAR(50),
	estado_prod VARCHAR(20),
	precio_prod DECIMAL(10, 2) NOT NULL DEFAULT(0.0),
	marca_prod VARCHAR(50),
	desc_prod VARCHAR(200),
	FOREIGN KEY (cod_subcat_prod) REFERENCES SUBCATEGORIA_PRODUCTO (cod_subcat_producto),
	FOREIGN KEY (cod_cat) REFERENCES CATEGORIA (cod_cat)
);

CREATE TABLE SUBCATEGORIA_PRODUCTO(
	cod_subcat_prod INTEGER IDENTITY(1, 1) PRIMARY KEY,
	cod_cat INTEGER,
	nom_subcat_prod VARCHAR(100) UNIQUE NOT NULL,
	descr_subcat_prod VARCHAR(200),
	imagen_representativa VARCHAR(200) UNIQUE NOT NULL
	FOREIGN KEY (cod_cat) REFERENCES CATEGORIA (cod_cat)
);

CREATE TABLE RECOMPENSA(
	cod_rec INTEGER IDENTITY(1, 1) PRIMARY KEY,
	titulo_rec VARCHAR(100) NOT NULL,
	desc_rec VARCHAR(100),
	monto_rec DECIMAL(12, 2) NOT NULL DEFAULT(0.0)
);

CREATE TABLE TIENE4(
	cod_evento INTEGER,
	cod_rec INTEGER,
	PRIMARY KEY (cod_evento, cod_rec),
	FOREIGN KEY (cod_evento) REFERENCES EVENTO (cod_evento),
	FOREIGN KEY (cod_rec) REFERENCES RECOMPENSA (cod_rec)
);

CREATE TABLE PROMOCION_SERVICIO(
	id_serv INTEGER,
	cod_prom INTEGER,
	PRIMARY KEY (id_serv, cod_prom),
	FOREIGN KEY (id_serv) REFERENCES SERVICIO (id_serv),
	FOREIGN KEY (cod_prom) REFERENCES PROMOCION (cod_prom)
);

CREATE TABLE SE_COMPONE_DE(
	id_mat INTEGER,
	id_prod INTEGER,
	PRIMARY KEY (id_mat, id_prod),
	FOREIGN KEY (id_mat) REFERENCES MATERIAL (id_mat),
	FOREIGN KEY (id_prod) REFERENCES PRODUCTO (id_prod)
);

CREATE TABLE MATERIAL(
	id_mat INTEGER IDENTITY(1, 1) PRIMARY KEY,
	nom_mat VARCHAR(100) UNIQUE NOT NULL,
	descr_mat VARCHAR(200),
	factor_co2 DECIMAL(10, 4) NOT NULL
);

CREATE TABLE CATEGORIA(
	cod_cat_prod INTEGER IDENTITY(1, 1) PRIMARY KEY,
	nom_cat_prod VARCHAR(100) UNIQUE NOT NULL,
	descr_cat_prod VARCHAR(200) NOT NULL,
	imagen_repr VARBINARY(MAX) UNIQUE NOT NULL
);

CREATE TABLE LOGRO(
	cod_logro INTEGER IDENTITY(1, 1) PRIMARY KEY,
	titulo_logro VARCHAR(100) UNIQUE NOT NULL,
	descr_logro VARCHAR(200),
	progreso DECIMAL(5, 2) NOT NULL DEFAULT(0.0),
	estado_logro VARCHAR(20),
	icono_logro VARBINARY(MAX) UNIQUE NOT NULL,
	calidad_logro VARCHAR(20) NOT NULL
);

CREATE TABLE PERTENECE(
	cod_logro INTEGER,
	cod_rec INTEGER,
	PRIMARY KEY (cod_logro, cod_rec),
	FOREIGN KEY (cod_logro) REFERENCES LOGRO (cod_logro),
	FOREIGN KEY (cod_rec) REFERENCES RECOMPENSA (cod_rec)
);

CREATE TABLE SERVICIO(
	id_serv INTEGER IDENTITY(1, 1) PRIMARY KEY,
	cod_cat INTEGER,
	nom_serv VARCHAR(100) NOT NULL,
	desc_serv VARCHAR(200),
	estado_serv VARCHAR(20) NOT NULL,
	precio_serv DECIMAL(10, 2) NOT NULL DEFAULT (0.00),
	duracion_serv INTEGER NOT NULL DEFAULT (0),
	dif_dist_serv DECIMAL(10, 2) NOT NULL DEFAULT (0.0),
	FOREIGN KEY (cod_cat) REFERENCES CATEGORIA (cod_cat)
);