-- === ESQUEMA COMPATIBLE CON POSTGRESQL ===
-- Notas de port: IDENTITY -> GENERATED ALWAYS AS IDENTITY
--               VARBINARY(MAX) -> BYTEA
--               DATETIME -> TIMESTAMP

CREATE TABLE ORGANIZACION(
    id_org INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom_com_org VARCHAR(100) NOT NULL,
    nom_legal_org VARCHAR(150) UNIQUE NOT NULL,
    tipo_org VARCHAR(50) NOT NULL,
    rubro VARCHAR(100) NOT NULL,
    cif VARCHAR(30) UNIQUE NOT NULL,
    correo_org VARCHAR(100) UNIQUE NOT NULL,
    telf_org VARCHAR(20) UNIQUE NOT NULL,
    dir_org VARCHAR(200) NOT NULL,
    fecha_registro_org TIMESTAMP NOT NULL,
    sitio_web VARCHAR(150),
    logo_org BYTEA
);

/*A�adi su repesctivo contraint a estado_adv
  A�adi constarint a motivo_adv*/
CREATE TABLE ADVERTENCIA(
    cod_adv INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    motivo_adv VARCHAR(200) NOT NULL,
    fecha_emision TIMESTAMP NOT NULL,
    estado_adv VARCHAR(20) NOT NULL,
    CONSTRAINT CK_estado_adv CHECK (estado_adv IN ('revisado','no revisado')),
    CONSTRAINT CK_motivo_adv CHECK (motivo_adv IN ('incumplimiento','contenido indebido','lenguaje inapropiado'))
);

--A�adi contarin a nom_rol
CREATE TABLE ROL(
    cod_rol INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom_rol VARCHAR(50) UNIQUE NOT NULL,
    descr_rol VARCHAR(200),
    CONSTRAINT CK_nom_rol CHECK (nom_rol IN ('usuario comun','emprendedor','administrador'))
);

CREATE TABLE PROMOCION(
    cod_prom INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo_prom VARCHAR(100) UNIQUE NOT NULL,
    fecha_ini_prom TIMESTAMP NOT NULL,
    duracion_prom INTEGER NOT NULL,
    fecha_fin_prom TIMESTAMP NOT NULL,
    descr_prom VARCHAR(300) NOT NULL,
    banner_prom BYTEA,
    descuento_prom DECIMAL(5,2) NOT NULL DEFAULT 0.0
);

CREATE TABLE RECOMPENSA(
    cod_rec INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    --titulo_rec VARCHAR(100) NOT NULL,
    --desc_rec VARCHAR(100),
    monto_rec DECIMAL(12, 2) NOT NULL DEFAULT 0.0
);

CREATE TABLE MATERIAL(
    id_mat INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom_mat VARCHAR(100) UNIQUE NOT NULL,
    descr_mat VARCHAR(200),
    factor_co2 DECIMAL(10, 4) NOT NULL
);

/*A�adi su respectivo constraint a estado_logro
  A�adi constarint a calidad_logro*/
CREATE TABLE LOGRO(
    cod_logro INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo_logro VARCHAR(100) UNIQUE NOT NULL,
    descr_logro VARCHAR(200),
    progreso DECIMAL(5, 2) NOT NULL DEFAULT 0.0,
    estado_logro VARCHAR(20),
    icono_logro BYTEA NOT NULL,
    calidad_logro VARCHAR(20) NOT NULL,
    CONSTRAINT CK_estado_logro CHECK (estado_logro IN ('permanente','temporal')),
    CONSTRAINT CK_calidad_logro CHECK (calidad_logro IN ('Legendario','Epico','Especial','Comun'))
);

/*A�adi el campo tipo_cat(VERIFICAR SI NO SE NECESITA OTRA TABLA NUEVA)
  A�adi contrain a tipo_cat*/
CREATE TABLE CATEGORIA(
    cod_cat INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom_cat VARCHAR(100) UNIQUE NOT NULL,
    descr_cat VARCHAR(200) NOT NULL,
    imagen_repr BYTEA NOT NULL,
    tipo_cat VARCHAR(20) NOT NULL,
    CONSTRAINT CK_tipo_cat CHECK (tipo_cat IN ('Producto','Servicio'))
);

-- 2) Tablas que dependen de CATEGORIA imagen_representativa no es VARCBINARY???
CREATE TABLE SUBCATEGORIA_PRODUCTO(
    cod_subcat_prod INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_cat INTEGER,
    nom_subcat_prod VARCHAR(100) UNIQUE NOT NULL,
    descr_subcat_prod VARCHAR(200),
    imagen_representativa BYTEA NOT NULL,
    FOREIGN KEY (cod_cat) REFERENCES CATEGORIA (cod_cat)
);

--A�adi su constraint en estado_serv
CREATE TABLE SERVICIO(
    id_serv INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_cat INTEGER,
    nom_serv VARCHAR(100) NOT NULL,
    desc_serv VARCHAR(200),
    estado_serv VARCHAR(20) NOT NULL,
    precio_serv DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    duracion_serv INTEGER NOT NULL DEFAULT 0,
    dif_dist_serv DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    CONSTRAINT CK_estado_serv CHECK (estado_serv IN ('disponible','no disponible')),
    FOREIGN KEY (cod_cat) REFERENCES CATEGORIA (cod_cat)
);

/*A�adi su constraint a estado_prod
  A�adi contrainr a calidad_prod*/
CREATE TABLE PRODUCTO(
    id_prod INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_subcat_prod INTEGER,
    nom_prod VARCHAR(100) NOT NULL,
    peso_prod DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    calidad_prod VARCHAR(50),
    estado_prod VARCHAR(20),
    precio_prod DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    marca_prod VARCHAR(50),
    desc_prod VARCHAR(200),
    CONSTRAINT CK_estado_prod CHECK (estado_prod IN ('disponible','agotado')),
    CONSTRAINT CK_calidad_prod CHECK (calidad_prod IN ('usado','nuevo')),
    FOREIGN KEY (cod_subcat_prod) REFERENCES SUBCATEGORIA_PRODUCTO (cod_subcat_prod)
);

CREATE TABLE PROMOCION_PRODUCTO(
    id_prod INTEGER,
    cod_prom INTEGER,
    PRIMARY KEY (id_prod, cod_prom),
    FOREIGN KEY (id_prod) REFERENCES PRODUCTO (id_prod),
    FOREIGN KEY (cod_prom) REFERENCES PROMOCION (cod_prom)
);

--Cambie nombre PERTENECE a RECOMPENSA_LOGRO
CREATE TABLE RECOMPENSA_LOGRO(
    cod_logro INTEGER,
    cod_rec INTEGER,
    PRIMARY KEY (cod_logro, cod_rec),
    FOREIGN KEY (cod_logro) REFERENCES LOGRO (cod_logro),
    FOREIGN KEY (cod_rec) REFERENCES RECOMPENSA (cod_rec)
);

CREATE TABLE PROMOCION_SERVICIO(
    id_serv INTEGER,
    cod_prom INTEGER,
    PRIMARY KEY (id_serv, cod_prom),
    FOREIGN KEY (id_serv) REFERENCES SERVICIO (id_serv),
    FOREIGN KEY (cod_prom) REFERENCES PROMOCION (cod_prom)
);

--Cambie nombre SE_COMPONE_DE a MATERIAL_PRODUCTO
CREATE TABLE MATERIAL_PRODUCTO(
    id_mat INTEGER,
    id_prod INTEGER,
    PRIMARY KEY (id_mat, id_prod),
    FOREIGN KEY (id_mat) REFERENCES MATERIAL (id_mat),
    FOREIGN KEY (id_prod) REFERENCES PRODUCTO (id_prod)
);

/*A�adi su coonstraint en estado_evento
  A�adi su contra a tipo_evento*/
CREATE TABLE EVENTO(
    cod_evento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_org INTEGER,
    titulo_evento VARCHAR(100) UNIQUE NOT NULL,
    descripcion_evento VARCHAR(200) NOT NULL,
    fecha_registro_evento TIMESTAMP NOT NULL,
    fecha_inicio_evento DATE NOT NULL,
    fecha_finalizacion_evento DATE NOT NULL,
    duracion_evento INTEGER NOT NULL,
    banner_evento VARCHAR(200),
    cant_personas_inscritas INTEGER NOT NULL DEFAULT 0,
    ganancia_evento DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado_evento VARCHAR(20) NOT NULL,
    tipo_evento VARCHAR(20) NOT NULL,
    CONSTRAINT CK_tipo_evento CHECK (tipo_evento IN ('BENEFICO','MONETIZABLE')),
    CONSTRAINT CK_estado_evento CHECK (estado_evento IN ('vigente','finalizado')),
    FOREIGN KEY (id_org) REFERENCES ORGANIZACION(id_org)
);

--Cambie nombre TIENE4 a EVENTO_RECOMPENSA
CREATE TABLE EVENTO_RECOMPENSA(
    cod_evento INTEGER,
    cod_rec INTEGER,
    PRIMARY KEY (cod_evento, cod_rec),
    FOREIGN KEY (cod_evento) REFERENCES EVENTO (cod_evento),
    FOREIGN KEY (cod_rec) REFERENCES RECOMPENSA (cod_rec)
);

/*Agregue su constraint a estado_us
  A�a�in su constraint a sexo*/
CREATE TABLE USUARIO(
    id_us INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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
    foto_us BYTEA,
    CONSTRAINT CK_estado_us CHECK (estado_us IN ('activo','suspendido','inactivo')),
    CONSTRAINT CK_sexo CHECK (sexo IN ('M','F')),
    FOREIGN KEY (cod_rol) REFERENCES ROL(cod_rol)
);

CREATE TABLE BILLETERA(
    cod_bill INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_us INTEGER,
    cuenta_bancaria VARCHAR(50) UNIQUE NOT NULL,
    saldo_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

--Quizas agtegar IDENTITY en cod_ubi
CREATE TABLE UBICACION(
    cod_ubi INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_us INTEGER,
    latitud_ubi DECIMAL(10,6) NOT NULL DEFAULT 0.0,
    longitud_ubi DECIMAL(10,6) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

--Agregue su constraint a estado_acc H
CREATE TABLE ACCESO(
    cod_acc INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_us INTEGER,
    estado_acc VARCHAR(20) NOT NULL,
    fecha_acc TIMESTAMP NOT NULL,
    contra_acc VARCHAR(100) NOT NULL,
    CONSTRAINT CK_estado_acc CHECK (estado_acc IN ('exitoso','no exitoso','logout')),
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

--Quizas cambiar el decimal(0-0.9) a(0-5) en calif
CREATE TABLE DETALLE_USUARIO(
    id_us INTEGER,
    cant_adv INTEGER NOT NULL DEFAULT 0,
    fecha_registro TIMESTAMP NOT NULL,
    cant_hrs_libres INTEGER NOT NULL DEFAULT 0,
    cant_dias_libres INTEGER NOT NULL DEFAULT 0,
    --hrs_libres INTEGER, --{(09:00 - VIE 22 DIC), (10:00 - VIE 22 DIC)...}
    dias_ocupados INTEGER NOT NULL DEFAULT 0,
    hrs_ocupadas INTEGER NOT NULL DEFAULT 0,
    calif_us DECIMAL(1, 1) NOT NULL DEFAULT 0.0,
    calif_pond_us DECIMAL(1, 1) NOT NULL DEFAULT 0.0,
    cant_ventas INTEGER NOT NULL DEFAULT 0,
    huella_co2 DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    PRIMARY KEY(id_us),
    FOREIGN KEY (id_us) REFERENCES USUARIO (id_us)
);

CREATE TABLE DISPONIBILIDAD(
    cod_disp INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_us INTEGER,
    hora_ini VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    fecha_dia DATE NOT NULL,
    FOREIGN KEY (id_us) REFERENCES USUARIO (id_us)
);

CREATE TABLE PUBLICACION(
    cod_pub INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_us INTEGER,
    fecha_ini_pub DATE NOT NULL,
    fecha_fin_pub DATE NOT NULL,
    foto_pub BYTEA,
    calif_pond_pub DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    impacto_amb_pub DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE CALIFICACIONES_PUBLICACION(
    cod_pub INTEGER,
    id_us INTEGER,
    calif_pub DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    PRIMARY KEY(cod_pub,id_us),
    FOREIGN KEY (cod_pub) REFERENCES PUBLICACION(cod_pub),
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE USUARIO_LOGRO(
    id_us INTEGER,
    fechaObtencion_logro TIMESTAMP,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE PUBLICACION_PRODUCTO(
    cod_pub INTEGER,
    id_prod INTEGER,
    cant_prod INTEGER NOT NULL DEFAULT 0,
    unidad_medida VARCHAR(20),
    PRIMARY KEY(cod_pub, id_prod),
    FOREIGN KEY (cod_pub) REFERENCES PUBLICACION (cod_pub),
    FOREIGN KEY (id_prod) REFERENCES PRODUCTO (id_prod)
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

--Agregue constraint a estado_trans
CREATE TABLE TRANSACCION(
    cod_trans INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_us_origen INTEGER,
    id_us_destino INTEGER,
    cod_pub INTEGER,
    cod_evento INTEGER,
    desc_trans VARCHAR(200) NOT NULL,
    fecha_trans TIMESTAMP NOT NULL,
    moneda VARCHAR(10) NOT NULL,
    monto_regalo DECIMAL(12,2) NOT NULL,
    estado_trans VARCHAR(20) NOT NULL,
    CONSTRAINT CK_estado_trans CHECK (estado_trans IN ('satisfactorio','no satisfactorio')),
    FOREIGN KEY (id_us_origen) REFERENCES USUARIO(id_us),
    FOREIGN KEY (id_us_destino) REFERENCES USUARIO(id_us),
    FOREIGN KEY (cod_pub) REFERENCES PUBLICACION(cod_pub),
    FOREIGN KEY (cod_evento) REFERENCES EVENTO(cod_evento)
);

--Ananin coonstrain a nivel_potenciador
CREATE TABLE POTENCIADOR(
    cod_potenciador INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_trans INTEGER,
    nombre_potenciador VARCHAR(100) UNIQUE NOT NULL,
    precio_potenciador DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    descripcion_potenciador VARCHAR(200) NOT NULL,
    multiplicador_potenciador DECIMAL(5,2) NOT NULL DEFAULT 1,
    fecha_inicio_potenciador TIMESTAMP NOT NULL,
    fecha_finalizacion_potenciador TIMESTAMP NOT NULL,
    duracion_potenciador INTEGER NOT NULL DEFAULT 1,
    nivel_potenciador INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT CK_nivel_potenciador CHECK (nivel_potenciador IN (1,2,3)),
    FOREIGN KEY (cod_trans) REFERENCES TRANSACCION(cod_trans)
);

--Cambie nombre PARTICIPA a USUARIO_EVENTO
CREATE TABLE USUARIO_EVENTO(
    cod_evento INTEGER,
    id_us INTEGER,
    PRIMARY KEY (cod_evento, id_us),
    FOREIGN KEY (cod_evento) REFERENCES EVENTO(cod_evento),
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE CONTRASENIA(
    cod_camb INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_us INTEGER,
    fecha_camb TIMESTAMP NOT NULL,
    correo_acc VARCHAR(100) NOT NULL,
    contra_prev VARCHAR(100) NOT NULL,
    contra_nueva VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

--Camn�bie nombre TIENE2 a USUARIO_ADVERTENCIA
CREATE TABLE USUARIO_ADVERTENCIA(
    cod_adv INTEGER,
    id_us INTEGER,
    PRIMARY KEY (cod_adv, id_us),
    FOREIGN KEY (cod_adv) REFERENCES ADVERTENCIA(cod_adv),
    FOREIGN KEY (id_us) REFERENCES USUARIO(id_us)
);

CREATE TABLE INTERCAMBIO(
    cod_inter INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_prod INTEGER,
    id_us_origen INTEGER,
    id_us_destino INTEGER,
    cant_prod INTEGER,
    unidad_medida VARCHAR(20),
    foto_inter BYTEA NOT NULL,
    impacto_amb_inter DECIMAL (10, 2) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (id_prod) REFERENCES PRODUCTO (id_prod),
    FOREIGN KEY (id_us_origen) REFERENCES USUARIO (id_us),
    FOREIGN KEY (id_us_destino) REFERENCES USUARIO (id_us)
);

--Cambie nombre PERTENECE2 a PUBLICACION_LOGRO
CREATE TABLE PUBLICACION_LOGRO(
    cod_pub INTEGER,
    cod_logro INTEGER,
    PRIMARY KEY (cod_pub, cod_logro),
    FOREIGN KEY (cod_pub) REFERENCES PUBLICACION (cod_pub),
    FOREIGN KEY (cod_logro) REFERENCES LOGRO (cod_logro)
);

--Cambie nombre de TIENE(no me acuerdo el numero *inserta patricio babeando*) a PUBLICACION_PROM0CION
CREATE TABLE PUBLICACION_PROMOCION(
    cod_pub INTEGER,
    cod_prom INTEGER,
    PRIMARY KEY (cod_pub, cod_prom),
    FOREIGN KEY (cod_pub) REFERENCES PUBLICACION (cod_pub),
    FOREIGN KEY (cod_prom) REFERENCES PROMOCION (cod_prom)
);

CREATE TABLE BITACORA(
    cod_bitacora INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_acc INTEGER,
    cod_trans INTEGER,
    cod_camb INTEGER,
    FOREIGN KEY (cod_acc) REFERENCES ACCESO(cod_acc),
    FOREIGN KEY (cod_trans) REFERENCES TRANSACCION(cod_trans),
    FOREIGN KEY (cod_camb) REFERENCES CONTRASENIA(cod_camb)
);

CREATE TABLE ESCROW(
  id_escrow INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estado_escrow VARCHAR(25) NOT NULL,
  cod_trans INTEGER,
  CONSTRAINT CK_estado_escrow CHECK (estado_escrow IN ('liberado','retenido')),
  FOREIGN KEY(cod_trans) REFERENCES TRANSACCION(cod_trans)
);
