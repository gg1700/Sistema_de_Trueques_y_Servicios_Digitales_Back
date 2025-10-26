--Revisado y Movido
CREATE TABLE ORGANIZACION(
    cod_org INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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

--Revisado y Movido
CREATE TABLE ADVERTENCIA(
    cod_adv INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    motivo_adv VARCHAR(200) NOT NULL,
    fecha_emision TIMESTAMP NOT NULL,
    estado_adv VARCHAR(20) NOT NULL,
    CONSTRAINT CK_estado_adv CHECK (estado_adv IN ('revisado','no revisado')),
    CONSTRAINT CK_motivo_adv CHECK (motivo_adv IN ('incumplimiento','contenido indebido','lenguaje inapropiado'))
);

--Revisado y Movido
CREATE TABLE ROL(
    cod_rol INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom_rol VARCHAR(50) UNIQUE NOT NULL,
    descr_rol VARCHAR(200),
    CONSTRAINT CK_nom_rol CHECK (nom_rol IN ('usuario comun','emprendedor','administrador'))
);

--Revisado y Movido
CREATE TABLE DISPONIBILIDAD(
    cod_disp INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hora_ini VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    fecha_dia DATE NOT NULL
);

--Revisado y Movido
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

--Revisado y Movido
CREATE TABLE RECOMPENSA(
    cod_rec INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    monto_rec DECIMAL(12, 2) NOT NULL DEFAULT 0.0
);

--Revisado y Movido
CREATE TABLE MATERIAL(
    cod_mat INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom_mat VARCHAR(100) UNIQUE NOT NULL,
    descr_mat VARCHAR(200),
    factor_co2 DECIMAL(10, 4) NOT NULL,
    unidad_medida_co2 VARCHAR(20) DEFAULT 'kg'
);

--Revisado y Movido
CREATE TABLE LOGRO(
    cod_logro INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo_logro VARCHAR(100) UNIQUE NOT NULL,
    descr_logro VARCHAR(200),
    icono_logro BYTEA NOT NULL,
    calidad_logro VARCHAR(20) NOT NULL,
    CONSTRAINT CK_calidad_logro CHECK (calidad_logro IN ('Legendario','Epico','Especial','Comun'))
);

--Revisado y Movido
CREATE TABLE CATEGORIA(
    cod_cat INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom_cat VARCHAR(100) UNIQUE NOT NULL,
    descr_cat VARCHAR(200) NOT NULL,
    imagen_repr BYTEA NOT NULL,
    tipo_cat VARCHAR(20) NOT NULL,
    CONSTRAINT CK_tipo_cat CHECK (tipo_cat IN ('Producto','Servicio'))
);

--Revisado y Movido
CREATE TABLE SUBCATEGORIA_PRODUCTO(
    cod_subcat_prod INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_cat INTEGER,
    nom_subcat_prod VARCHAR(100) UNIQUE NOT NULL,
    descr_subcat_prod VARCHAR(200),
    imagen_representativa BYTEA NOT NULL,
    FOREIGN KEY (cod_cat) 
        REFERENCES CATEGORIA(cod_cat)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE SERVICIO(
    cod_serv INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_cat INTEGER,
    nom_serv VARCHAR(100) NOT NULL,
    desc_serv VARCHAR(200),
    estado_serv VARCHAR(20) NOT NULL,
    precio_serv DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    duracion_serv INTEGER NOT NULL DEFAULT 0,
    dif_dist_serv DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    CONSTRAINT CK_estado_serv CHECK (estado_serv IN ('disponible','no disponible')),
    FOREIGN KEY (cod_cat) 
        REFERENCES CATEGORIA (cod_cat)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE PRODUCTO(
    cod_prod INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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
    FOREIGN KEY (cod_subcat_prod) 
        REFERENCES SUBCATEGORIA_PRODUCTO (cod_subcat_prod)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE PROMOCION_PRODUCTO(
    cod_subcat_prod INTEGER,
    cod_prom INTEGER,
    PRIMARY KEY (cod_subcat_prod, cod_prom),
    FOREIGN KEY (cod_subcat_prod) 
        REFERENCES SUBCATEGORIA_PRODUCTO (cod_subcat_prod)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_prom) 
        REFERENCES PROMOCION (cod_prom)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE RECOMPENSA_LOGRO(
    cod_logro INTEGER,
    cod_rec INTEGER,
    PRIMARY KEY (cod_logro, cod_rec),
    FOREIGN KEY (cod_logro) 
        REFERENCES LOGRO (cod_logro)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_rec) 
        REFERENCES RECOMPENSA (cod_rec)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE PROMOCION_SERVICIO(
    cod_cat INTEGER,
    cod_prom INTEGER,
    PRIMARY KEY (cod_cat, cod_prom),
    FOREIGN KEY (cod_cat) 
        REFERENCES CATEGORIA (cod_cat)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_prom) 
        REFERENCES PROMOCION (cod_prom)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE MATERIAL_PRODUCTO(
    cod_mat INTEGER,
    cod_prod INTEGER,
    PRIMARY KEY (cod_mat, cod_prod),
    FOREIGN KEY (cod_mat) 
        REFERENCES MATERIAL (cod_mat)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_prod) 
        REFERENCES PRODUCTO (cod_prod)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE EVENTO(
    cod_evento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_org INTEGER,
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
    costo_inscripcion DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT CK_tipo_evento CHECK (tipo_evento IN ('benefico','monetizable')),
    CONSTRAINT CK_estado_evento CHECK (estado_evento IN ('vigente','finalizado')),
    FOREIGN KEY (cod_org) 
        REFERENCES ORGANIZACION(cod_org)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE EVENTO_RECOMPENSA(
    cod_evento INTEGER,
    cod_rec INTEGER,
    PRIMARY KEY (cod_evento, cod_rec),
    FOREIGN KEY (cod_evento)
        REFERENCES EVENTO (cod_evento)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_rec) 
        REFERENCES RECOMPENSA (cod_rec)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE POTENCIADOR(
    cod_potenciador INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_potenciador VARCHAR(100) UNIQUE NOT NULL,
    precio_potenciador DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    descripcion_potenciador VARCHAR(200) NOT NULL,
    multiplicador_potenciador DECIMAL(5,2) NOT NULL DEFAULT 1,
    fecha_inicio_potenciador TIMESTAMP NOT NULL,
    fecha_finalizacion_potenciador TIMESTAMP NOT NULL,
    duracion_potenciador INTEGER NOT NULL DEFAULT 1,
    nivel_potenciador INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT CK_nivel_potenciador CHECK (nivel_potenciador IN (1,2,3))
);

--Revisado y Movido
CREATE TABLE USUARIO(
    cod_us INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_rol INTEGER,
    cod_disp INTEGER,
    ci VARCHAR(20) UNIQUE NOT NULL,
    nom_us VARCHAR(100) NOT NULL,
    handle_name VARCHAR(50) UNIQUE NOT NULL,
    ap_pat_us VARCHAR(50) NOT NULL,
    ap_mat_us VARCHAR(50) NOT NULL,
    contra_us VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    sexo CHAR(1) NOT NULL,
    estado_us VARCHAR(20) NOT NULL,
    correo_us VARCHAR(100) NOT NULL,
    telefono_us VARCHAR(20) NOT NULL,
    foto_us BYTEA,
    CONSTRAINT CK_estado_us CHECK (estado_us IN ('activo','suspendido','inactivo')),
    CONSTRAINT CK_sexo CHECK (sexo IN ('M','F')),
    FOREIGN KEY (cod_rol) 
        REFERENCES ROL(cod_rol)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (cod_disp) 
        REFERENCES DISPONIBILIDAD(cod_disp)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

--Revisado y Movido
CREATE TABLE BILLETERA(
    cod_bill INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_us INTEGER,
    cuenta_bancaria VARCHAR(50) UNIQUE NOT NULL,
    saldo_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (cod_us) 
        REFERENCES USUARIO(cod_us)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE UBICACION(
    cod_ubi INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_us  INTEGER,
    latitud_ubi DECIMAL(10,6) NOT NULL DEFAULT 0.0,
    longitud_ubi DECIMAL(10,6) NOT NULL DEFAULT 0.0,
    nom_ubi VARCHAR(100) NOT NULL,
    FOREIGN KEY (cod_us) 
        REFERENCES USUARIO(cod_us)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

--Revisado y Movido
CREATE TABLE ACCESO(
    cod_acc INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_us INTEGER,
    estado_acc VARCHAR(20) NOT NULL,
    fecha_acc TIMESTAMP NOT NULL,
    contra_acc VARCHAR(100) NOT NULL,
    CONSTRAINT CK_estado_acc CHECK (estado_acc IN ('exitoso','no exitoso','logout')),
    FOREIGN KEY (cod_us) 
        REFERENCES USUARIO(cod_us)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE DETALLE_USUARIO(
    cod_us INTEGER PRIMARY KEY,
    cant_adv INTEGER NOT NULL DEFAULT 0,
    fecha_registro TIMESTAMP NOT NULL,
    cant_hrs_libres INTEGER NOT NULL DEFAULT 0,
    cant_dias_libres INTEGER NOT NULL DEFAULT 0,
    dias_ocupados INTEGER NOT NULL DEFAULT 0,
    hrs_ocupadas INTEGER NOT NULL DEFAULT 0,
    calif_pond_us DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
    cant_ventas INTEGER NOT NULL DEFAULT 0,
    huella_co2 DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (cod_us) 
        REFERENCES USUARIO(cod_us)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE PUBLICACION(
    cod_pub INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_us INTEGER,
    fecha_ini_pub DATE NOT NULL,
    fecha_fin_pub DATE NOT NULL,
    foto_pub BYTEA,
    calif_pond_pub DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    impacto_amb_pub DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (cod_us) 
        REFERENCES USUARIO(cod_us)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE CALIFICACION(
    cod_calif INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    calificacion_us DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    cod_us_calificador INTEGER,
    cod_us_calificado INTEGER,
    FOREIGN KEY (cod_us_calificador) 
        REFERENCES USUARIO(cod_us)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (cod_us_calificado) REFERENCES USUARIO(cod_us)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

--Revisado y Movido
CREATE TABLE USUARIO_LOGRO(
    cod_us INTEGER,
    cod_logro INTEGER,
    progreso DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    estado_logro VARCHAR(20) NOT NULL,
    fecha_obtencion_logro TIMESTAMP,
    CONSTRAINT CK_estado_logro CHECK (estado_logro IN ('Completado','En progreso')),
    PRIMARY KEY(cod_us, cod_logro),
    FOREIGN KEY (cod_us) 
        REFERENCES USUARIO(cod_us)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (cod_logro) 
        REFERENCES LOGRO(cod_logro)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

--Revisado y Movido
CREATE TABLE USUARIO_EVENTO(
    cod_evento INTEGER,
    cod_us INTEGER,
    PRIMARY KEY (cod_evento, cod_us),
    FOREIGN KEY (cod_evento) 
        REFERENCES EVENTO(cod_evento)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_us) 
        REFERENCES USUARIO(cod_us)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE PUBLICACION_PRODUCTO(
    cod_pub INTEGER,
    cod_prod INTEGER,
    cant_prod INTEGER NOT NULL DEFAULT 0,
    unidad_medida VARCHAR(20),
    PRIMARY KEY(cod_pub, cod_prod),
    FOREIGN KEY (cod_pub) 
        REFERENCES PUBLICACION (cod_pub)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_prod) 
        REFERENCES PRODUCTO (cod_prod)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE PUBLICACION_SERVICIO(
    cod_pub INTEGER,
    cod_serv INTEGER,
    hrs_ini_dia_serv TIME NOT NULL,
    hrs_fin_dia_serv TIME NOT NULL,
    PRIMARY KEY (cod_pub, cod_serv),
    FOREIGN KEY (cod_pub) 
        REFERENCES PUBLICACION(cod_pub)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_serv) 
        REFERENCES SERVICIO(cod_serv)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE USUARIO_ADVERTENCIA(
    cod_adv INTEGER,
    cod_us INTEGER,
    PRIMARY KEY (cod_adv, cod_us),
    FOREIGN KEY (cod_adv) 
        REFERENCES ADVERTENCIA(cod_adv)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_us) 
        REFERENCES USUARIO(cod_us)
        ON DELETE CASCADE
        ON UPDATE CASCADE    
);

--Revisado y Movido
CREATE TABLE CONTRASENIA(
    cod_camb INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_us INTEGER,
    fecha_camb TIMESTAMP NOT NULL,
    correo_acc VARCHAR(100) NOT NULL,
    contra_prev VARCHAR(100) NOT NULL,
    contra_nueva VARCHAR(100) NOT NULL,
    FOREIGN KEY (cod_us) 
        REFERENCES USUARIO(cod_us)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE INTERCAMBIO(
    cod_inter INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_us_1 INTEGER,
    cod_us_2 INTEGER,
    cant_prod INTEGER,
    unidad_medida VARCHAR(20),
    foto_inter BYTEA NOT NULL,
    impacto_amb_inter DECIMAL (10, 2) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (cod_us_1) 
        REFERENCES USUARIO (cod_us)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (cod_us_2) 
        REFERENCES USUARIO (cod_us)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

--Revisado y Movido
CREATE TABLE INTERCAMBIO_PRODUCTO(
    cod_inter INTEGER,
    cod_prod INTEGER,
    PRIMARY KEY (cod_inter, cod_prod),
    FOREIGN KEY (cod_inter) 
        REFERENCES INTERCAMBIO (cod_inter)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_prod) 
        REFERENCES PRODUCTO (cod_prod)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE CALIFICACIONES_PUBLICACION(
    cod_pub INTEGER,
    cod_us INTEGER,
    calif_pub DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    PRIMARY KEY(cod_pub,cod_us),
    FOREIGN KEY (cod_pub) 
        REFERENCES PUBLICACION(cod_pub)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_us) 
        REFERENCES USUARIO(cod_us)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE TRANSACCION(
    cod_trans INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_us_origen INTEGER,
    cod_us_destino INTEGER,
    cod_pub INTEGER,
    cod_evento INTEGER,
    cod_potenciador INTEGER,
    desc_trans VARCHAR(200) NOT NULL,
    fecha_trans TIMESTAMP NOT NULL,
    moneda VARCHAR(10) NOT NULL,
    monto_regalo DECIMAL(12,2) NULL,
    estado_trans VARCHAR(20) NOT NULL,
    CONSTRAINT CK_estado_trans CHECK (estado_trans IN ('satisfactorio','no satisfactorio')),
    FOREIGN KEY (cod_us_origen) 
        REFERENCES USUARIO(cod_us),
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (cod_us_destino) 
        REFERENCES USUARIO(cod_us),
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (cod_pub) 
        REFERENCES PUBLICACION(cod_pub)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (cod_evento) 
        REFERENCES EVENTO(cod_evento)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (cod_potenciador) 
        REFERENCES POTENCIADOR(cod_potenciador)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

--Revisado y Movido
CREATE TABLE PUBLICACION_PROMOCION(
    cod_pub INTEGER,
    cod_prom INTEGER,
    PRIMARY KEY (cod_pub, cod_prom),
    FOREIGN KEY (cod_pub) 
        REFERENCES PUBLICACION (cod_pub)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_prom) 
        REFERENCES PROMOCION (cod_prom)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE BITACORA(
    cod_bitacora INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_acc INTEGER,
    cod_trans INTEGER,
    cod_camb INTEGER,
    FOREIGN KEY (cod_acc) 
        REFERENCES ACCESO(cod_acc)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_trans) 
        REFERENCES TRANSACCION(cod_trans)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cod_camb) 
        REFERENCES CONTRASENIA(cod_camb)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

--Revisado y Movido
CREATE TABLE ESCROW(
  cod_escrow INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  estado_escrow VARCHAR(25) NOT NULL,
  cod_trans INTEGER,
  CONSTRAINT CK_estado_escrow CHECK (estado_escrow IN ('liberado','retenido')),
  FOREIGN KEY(cod_trans) 
    REFERENCES TRANSACCION(cod_trans)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

--Revisado y Movido
CREATE TABLE EQUIVALENCIA_CO2(
    cod_equiv INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_mat INTEGER NOT NULL,
    unidad_origen VARCHAR(20) NOT NULL,
    unidad_destino VARCHAR(20) NOT NULL DEFAULT 'kg_co2',
    factor_conversion DECIMAL(12, 6) NOT NULL,
    descripcion_equiv VARCHAR(200),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    fuente_datos VARCHAR(200), -- De dónde proviene el dato
    CONSTRAINT UK_equiv_material_unidades UNIQUE(cod_mat, unidad_origen, unidad_destino),
    FOREIGN KEY (cod_mat) 
        REFERENCES MATERIAL(cod_mat)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

COMMENT ON TABLE EQUIVALENCIA_CO2 IS 'Tabla de equivalencias para cálculo de huella de carbono';

--ESTE MENSAJE ESTA DEDICADO AL BOCHITO, PORQUE ME DIJERON QUE SE PUEDE DIVIDIR EN DOS PARA ESTUDIAR TSO Y HACER TBD. GRACIAS BOCHITO.
