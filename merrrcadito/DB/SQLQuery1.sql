CREATE DATABASE MRRRDATABASE;

USE MRRRDATABASE;


--PERMISOS DE USUARIO PARA ACCESO A LA BD
--CREATE LOGIN Administrador WITH PASSWORD='esnupi988';
--CREATE USER Administrador FOR LOGIN Administrador;


CREATE TABLE BITACORA(
    cod_bitacora INTEGER IDENTITY(1,1) PRIMARY KEY,
    cod_acc INTEGER,
    cod_trans INTEGER,
    cod_camb INTEGER,
    FOREIGN KEY (cod_acc) REFERENCES ACCESO(cod_acc),
    FOREIGN KEY (cod_trans) REFERENCES TRANSACCION(cod_trans),
    FOREIGN KEY (cod_camb) REFERENCES CONTRASENIA(cod_camb)
);




CREATE TABLE ACCESO(
	cod_acc INTEGER IDENTITY(1,1) PRIMARY KEY,
	id_us INTEGER,
	estado_acc VARCHAR(20) NOT NULL,
	fecha_acc DATETIME NOT NULL,
	contra_acc VARCHAR(100) UNIQUE NOT NULL,
	FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);



CREATE TABLE USUARIO(
	id_us INT IDENTITY(1,1) PRIMARY KEY,
	cod_bill INTEGER, 
	cod_rol INTEGER,  
	cod_ubi INTEGER,   
	ci VARCHAR(20) UNIQUE NOT NULL,
	nom_us VARCHAR(100) NOT NULL,
	handle_name VARCHAR(50) UNIQUE NOT NULL,
	ap_pat_us VARCHAR(50) NOT NULL,
	ap_mat_us VARCHAR(50) NOT NULL,
	contra_us VARCHAR(100) UNIQUE NOT NULL,
	fecha_nacimiento DATE,
	sexo CHAR(1) NOT NULL,
	estado_us VARCHAR(20) NOT NULL,
	correo_us VARCHAR(100) NOT NULL,
	telefono_us VARCHAR(20) NOT NULL,
	foto_us VARBINARY(MAX),
	FOREIGN KEY (cod_bill) REFERENCES BILLETERA(cod_bill),
	FOREIGN KEY (cod_rol) REFERENCES ROL(cod_rol),
	FOREIGN KEY (cod_ubi) REFERENCES UBICACION(cod_ubi)
);


CREATE TABLE BILLETERA(
	cod_bill INTEGER IDENTITY(1,1) PRIMARY KEY,
	id_us INTEGER,
	cuenta_bancaria VARCHAR(50) UNIQUE NOT NULL,
	saldo_actual DECIMAL(12,2) NOT NULL DEFAULT(0),
	FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

---------------------------------------------------------

CREATE TABLE TRANSACCION(
	cod_trans INTEGER IDENTITY(1,1) PRIMARY KEY,
	id_us_origen INTEGER, 
	id_us_destino INTEGER,   
	cod_pub INTEGER,      
	cod_evento INTEGER,   
	desc_trans VARCHAR(200) NOT NULL,
	fecha_trans DATETIME NOT NULL,
	moneda VARCHAR(10) NOT NULL,
	monto_regalo DECIMAL(12,2) NOT NULL,
	estado_trans VARCHAR(20) NOT NULL,
	FOREIGN KEY (id_us_origen) REFERENCES USUARIO(id_us),
	FOREIGN KEY (id_us_destino) REFERENCES USUARIO(id_us),
	FOREIGN KEY (cod_pub) REFERENCES PUBLICACION(cod_pub),
	FOREIGN KEY (cod_evento) REFERENCES EVENTO(cod_evento)
);



CREATE TABLE EVENTO(
	cod_evento INTEGER IDENTITY(1,1) PRIMARY KEY,
	id_org INTEGER, 
	titulo_evento VARCHAR(100) UNIQUE NOT NULL,
	descripcion_evento VARCHAR(200) NOT NULL,
	fecha_registro_evento DATETIME NOT NULL,
	fecha_inicio_evento DATE NOT NULL,
	fecha_finalizacion_evento DATE NOT NULL,
	duracion_evento INTEGER NOT NULL,
	banner_evento VARCHAR(200),
	cant_personas_inscritas INTEGER NOT NULL DEFAULT(0),
	ganancia_evento DECIMAL(12,2) NOT NULL DEFAULT(0),
	estado_evento VARCHAR(20) NOT NULL,
	FOREIGN KEY (id_org) REFERENCES ORGANIZACION(id_org)
);



CREATE TABLE UBICACION(
    cod_ubi INTEGER PRIMARY KEY,   
	id_us INTEGER,
    latitud_ubi DECIMAL(10,6) NOT NULL DEFAULT(0.0),
    longitud_ubi DECIMAL(10,6) NOT NULL DEFAULT(0.0),
	FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);


CREATE TABLE usuario_logro (
    id_us INTEGER,                   
    fechaObtencion_logro DATETIME,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE POTENCIADOR(
	cod_potenciador INTEGER IDENTITY(1,1) PRIMARY KEY,
	cod_trans INTEGER,  
	nombre_potenciador VARCHAR(100) UNIQUE NOT NULL,
	precio_potenciador DECIMAL(12,2) NOT NULL DEFAULT(0.0),
	descripcion_potenciador VARCHAR(200) NOT NULL,
	multiplicador_potenciador DECIMAL(5,2) NOT NULL DEFAULT(1),
	fecha_inicio_potenciador DATETIME NOT NULL,
	fecha_finalizacion_potenciador DATETIME NOT NULL,
	duracion_potenciador INTEGER NOT NULL DEFAULT (1),
	nivel_potenciador INTEGER NOT NULL DEFAULT (1),
	FOREIGN KEY (cod_trans) REFERENCES TRANSACCION(cod_trans)
);


CREATE TABLE TIENE3(
	cod_rec INTEGER,
	id_us INTEGER,
	PRIMARY KEY (cod_rec, id_us),
	FOREIGN KEY (cod_rec) REFERENCES RECOMPENSA(cod_rec),
	FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE PARTICIPA(
	cod_evento INTEGER,
	id_us INTEGER,
	PRIMARY KEY (cod_evento, id_us),
	FOREIGN KEY (cod_evento) REFERENCES EVENTO(cod_evento),
	FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);


CREATE TABLE CONTRASENIA(
	cod_camb INTEGER IDENTITY(1,1) PRIMARY KEY,
	id_us INTEGER,
	fecha_camb DATETIME NOT NULL,
	correo_acc VARCHAR(100) NOT NULL,
	contra_prev VARCHAR(100) NOT NULL,
	contra_nueva VARCHAR(100) NOT NULL,
	FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE ADVERTENCIA(
	cod_adv INTEGER IDENTITY(1,1) PRIMARY KEY,
	motivo_adv VARCHAR(200) NOT NULL,
	fecha_emision DATETIME NOT NULL,
	estado_adv VARCHAR(20) NOT NULL
);

CREATE TABLE TIENE2(
	cod_adv INTEGER,
	id_us INTEGER,
	PRIMARY KEY (cod_adv, id_us),
	FOREIGN KEY (cod_adv) REFERENCES ADVERTENCIA(cod_adv),
	FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE PUBLICACION_SERVICIO(
	cod_pub INTEGER,
	id_serv INTEGER,
	hrs_ini_dia_serv TIME NOT NULL,
	hrs_fin_dia_serv TIME NOT NULL,
	PRIMARY KEY (cod_pub, id_serv),
	FOREIGN KEY (cod_pub) REFERENCES PUBLICACION(cod_pub),
	FOREIGN KEY (id_serv) REFERENCES SERVICIO(id_serv)
);

CREATE TABLE PUBLICACION(
	cod_pub INTEGER IDENTITY(1,1) PRIMARY KEY,
	id_us INTEGER,
	fecha_ini_pub DATE NOT NULL,
	fecha_fin_pub DATE NOT NULL,
	foto_pub VARBINARY(MAX),
	calif_pond_pub DECIMAL(3,2) NOT NULL DEFAULT(0.0),
	impacto_amb_pub DECIMAL(10,2) NOT NULL DEFAULT(0.0),
	FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE CALIFICACIONES_PUBLICACION(
	cod_pub INTEGER,
	id_us INTEGER,
	PRIMARY KEY(cod_pub,id_us),
	calif_pub DECIMAL(3,2) NOT NULL DEFAULT(0.0),
	FOREIGN KEY (cod_pub) REFERENCES PUBLICACION(cod_pub),
	FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);















