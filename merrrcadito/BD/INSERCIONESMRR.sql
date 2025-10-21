USE MRRRDB;


INSERT INTO ROL (nom_rol, descr_rol)
VALUES
('usuario comun', 'Usuario que puede publicar/adquirir prodcutos y servicios, puede participar en eventos gratuitos y monetizados'),
('emprendedor', 'Usuario que puede publicar productos o servicios, puede participar en eventos gratuitor y monetizados, tiene la posibilidad de monetizar'),
('administrador', 'Usuario con permisos de gestión, puede obtener reportes, dar de baja a usuarios, administrar la plataforma');


INSERT INTO USUARIO (cod_bill, cod_rol, cod_ubi, ci, nom_us, handle_name, ap_pat_us, ap_mat_us, contra_us, fecha_nacimiento, sexo, estado_us, correo_us, telefono_us, foto_us)
VALUES
(1, 1, 101, 'CI1001', 'Juan Carlos', 'jccarlos', 'Rojas', 'Guzmán', 'contra123', '1990-05-12', 'M', 'activo', 'juan.carlos@mail.com', '70010001', 0x),
(2, 1, 102, 'CI1002', 'María Fernanda', 'mfernanda', 'Gómez', 'Lozano', 'clave456', '1992-08-20', 'F', 'activo', 'maria.fernanda@mail.com', '70010002', 0x),
(3, 1, 103, 'CI1003', 'Luis Alberto', 'lalberto', 'Quispe', 'Ramos', 'password1', '1988-03-15', 'M', 'activo', 'luis.alberto@mail.com', '70010003', 0x),
(4, 1, 104, 'CI1004', 'Ana Sofía', 'asofia', 'Vargas', 'Mendoza', 'pass789', '1995-11-02', 'F', 'activo', 'ana.sofia@mail.com', '70010004', 0x),
(5, 1, 105, 'CI1005', 'Pedro Miguel', 'pmiguel', 'Torrez', 'Salinas', 'clave789', '1991-06-25', 'M', 'activo', 'pedro.miguel@mail.com', '70010005', 0x),
(6, 1, 106, 'CI1006', 'Gabriela Andrea', 'gandreah', 'López', 'Castro', 'gaby123', '1993-09-10', 'F', 'activo', 'gabriela.andrea@mail.com', '70010006', 0x),
(7, 1, 107, 'CI1007', 'Carlos Eduardo', 'ceduardo', 'Ríos', 'Fernández', 'edu456', '1989-12-01', 'M', 'activo', 'carlos.eduardo@mail.com', '70010007', 0x),
(8, 1, 108, 'CI1008', 'Paola Cristina', 'pcristina', 'Mamani', 'Suárez', 'paola321', '1994-07-18', 'F', 'activo', 'paola.cristina@mail.com', '70010008', 0x);

INSERT INTO USUARIO (cod_bill, cod_rol, cod_ubi, ci, nom_us, handle_name, ap_pat_us, ap_mat_us, contra_us, fecha_nacimiento, sexo, estado_us, correo_us, telefono_us, foto_us)
VALUES
(9, 2, 201, 'CI2001', 'Diego Martín', 'dmartin', 'Salvatierra', 'Paz', 'emprende1', '1987-04-22', 'M', 'activo', 'diego.martin@mail.com', '70020001', 0x),
(10, 2, 202, 'CI2002', 'Valeria Judith', 'vjudith', 'Flores', 'Heredia', 'valeria22', '1990-10-05', 'F', 'activo', 'valeria.judith@mail.com', '70020002', 0x),
(11, 2, 203, 'CI2003', 'Jorge Luis', 'jorgel', 'Maldonado', 'Ríos', 'jorge88', '1986-01-30', 'M', 'activo', 'jorge.luis@mail.com', '70020003', 0x),
(12, 2, 204, 'CI2004', 'Claudia Irene', 'cirene', 'Gutiérrez', 'Montes', 'claudia44', '1991-03-09', 'F', 'activo', 'claudia.irene@mail.com', '70020004', 0x),
(13, 2, 205, 'CI2005', 'Fernando José', 'fjosé', 'Aguilar', 'Cárdenas', 'fer1234', '1989-05-27', 'M', 'activo', 'fernando.jose@mail.com', '70020005', 0x),
(14, 2, 206, 'CI2006', 'Liliana Beatriz', 'lilibe', 'Ortiz', 'Camacho', 'lili567', '1992-02-14', 'F', 'activo', 'liliana.beatriz@mail.com', '70020006', 0x);

INSERT INTO USUARIO (cod_bill, cod_rol, cod_ubi, ci, nom_us, handle_name, ap_pat_us, ap_mat_us, contra_us, fecha_nacimiento, sexo, estado_us, correo_us, telefono_us, foto_us)
VALUES
(15, 3, 301, 'CI3001', 'Marco Antonio', 'mantonio', 'Rivero', 'Soto', 'admin123', '1985-07-12', 'M', 'activo', 'marco.antonio@mail.com', '70030001', 0x);


INSERT INTO BILLETERA (id_us, cuenta_bancaria, saldo_actual)
VALUES
(1, '111100000001', 500.00),
(2, '111100000002', 750.00),
(3, '111100000003', 300.00),
(4, '111100000004', 1200.00),
(5, '111100000005', 450.00),
(6, '111100000006', 800.00),
(7, '111100000007', 600.00),
(8, '111100000008', 950.00),
(9, '222200000001', 1500.00),
(10, '222200000002', 2000.00),
(11, '222200000003', 1800.00),
(12, '222200000004', 2200.00),
(13, '222200000005', 1700.00),
(14, '222200000006', 900.00),
(15, '333300000001', 2500.00);

--Para poner los cod bill con sus usuarios
UPDATE U
SET U.cod_bill = B.cod_bill
FROM USUARIO U
INNER JOIN BILLETERA B
    ON U.id_us = B.id_us;


    SELECT * FROM USUARIO;


INSERT INTO UBICACION (cod_ubi, id_us, latitud_ubi, longitud_ubi)
VALUES
(1, 1, -16.500000, -68.150000),
(2, 2, -16.502000, -68.145000),
(3, 3, -16.498000, -68.155000),
(4, 4, -16.501500, -68.148000),
(5, 9, -16.495000, -68.160000),
(6, 10, -16.497500, -68.162500);

UPDATE U
SET U.cod_ubi = UB.cod_ubi
FROM USUARIO U
INNER JOIN UBICACION UB ON U.id_us=UB.id_us;


INSERT INTO DETALLE_USUARIO (id_us, fecha_registro)
VALUES
(1, '2025-10-01 09:00'),
(2, '2025-09-25 10:30'),
(3, '2025-09-28 08:15'),
(4, '2025-09-20 14:45');

INSERT INTO DETALLE_USUARIO
(id_us, cant_adv, fecha_registro, cant_hrs_libres, cant_dias_libres, dias_ocupados, hrs_ocupadas, calif_us, calif_pond_us, cant_ventas, huella_co2)
VALUES
(5, 0, '2025-10-05 11:00', 9, 5, 2, 13, 0.8, 0.7, 4, 11.00),
(6, 1, '2025-09-30 12:20', 7, 3, 3, 16, 0.7, 0.6, 1, 8.50),
(7, 0, '2025-10-03 15:00', 11, 6, 2, 14, 0.9, 0.8, 6, 13.30),
(8, 0, '2025-09-29 09:45', 10, 5, 2, 12, 0.8, 0.7, 5, 12.00),
(9, 1, '2025-09-27 10:10', 8, 4, 3, 15, 0.7, 0.6, 4, 11.50),
(10, 0, '2025-10-02 08:30', 12, 6, 1, 10, 0.9, 0.8, 8, 14.20),
(11, 2, '2025-09-26 14:00', 5, 3, 4, 18, 0.6, 0.5, 2, 9.00),
(12, 0, '2025-10-04 13:15', 9, 5, 2, 12, 0.8, 0.7, 5, 12.10),
(13, 0, '2025-09-23 11:45', 10, 5, 2, 13, 0.8, 0.7, 3, 11.20),
(14, 1, '2025-09-22 09:20', 7, 4, 3, 16, 0.7, 0.6, 2, 10.50),
(15, 0, '2025-10-01 10:50', 11, 6, 2, 14, 0.9, 0.8, 6, 13.00);


INSERT INTO ORGANIZACION
(nom_com_org, nom_legal_org, tipo_org, rubro, cif, correo_org, telf_org, dir_org, fecha_registro_org, sitio_web, logo_org)
VALUES
('Tech Solutions', 'Tech Solutions S.A.', 'Privada', 'Tecnología', 'CIF1001', 'contacto@techsolutions.com', '70040001', 'Av. Bolivia 123, La Paz', '2025-10-10 09:00', 'www.techsolutions.com', 0x),
('Green Energy', 'Green Energy Ltda.', 'Privada', 'Energía Renovable', 'CIF1002', 'info@greenenergy.com', '70040002', 'Calle Los Pinos 456, Cochabamba', '2025-10-11 10:30', 'www.greenenergy.com', 0x),
('Educa Futuro', 'Educa Futuro Fundación', 'Fundación', 'Educación', 'CIF1003', 'contacto@educafuturo.org', '70040003', 'Av. Argentina 789, Santa Cruz', '2025-10-12 11:15', 'www.educafuturo.org', 0x),
('BioSalud', 'BioSalud S.R.L.', 'Privada', 'Salud', 'CIF1004', 'info@biosalud.com', '70040004', 'Calle Sucre 321, La Paz', '2025-10-13 08:45', 'www.biosalud.com', 0x);


INSERT INTO ADVERTENCIA (motivo_adv, fecha_emision, estado_adv)
VALUES
('incumplimiento', '2025-10-01 09:30', 'no revisado'),
('contenido indebido', '2025-10-05 14:15', 'revisado'),
('lenguaje inapropiado', '2025-10-08 11:45', 'no revisado');


INSERT INTO PROMOCION
(titulo_prom, fecha_ini_prom, duracion_prom, fecha_fin_prom, descr_prom, banner_prom, descuento_prom)
VALUES
('Semana Tecnológica', '2025-10-15 00:00', 7, '2025-10-22 00:00', 'Descuentos en todos los productos tecnológicos.', 0x, 15.00),
('Eco Energy', '2025-10-20 00:00', 10, '2025-10-30 00:00', 'Promoción especial en energía renovable.', 0x, 25.00),
('Educa Futuro', '2025-11-01 00:00', 14, '2025-11-15 00:00', 'Cursos y talleres con descuento especial.', 0x, 20.00),
('BioSalud Oferta', '2025-10-18 00:00', 5, '2025-10-23 00:00', 'Promoción en productos y servicios de salud.', 0x, 30.00),
('Black Friday Tech', '2025-11-25 00:00', 3, '2025-11-28 00:00', 'Descuentos increíbles en tecnología.', 0x, 40.00),
('Navidad Verde', '2025-12-10 00:00', 15, '2025-12-25 00:00', 'Promoción especial de Navidad en productos sostenibles.', 0x, 50.00);

INSERT INTO RECOMPENSA (titulo_rec, desc_rec, monto_rec)
VALUES
('Bono Bienvenida', 'Bono inicial por registrarse', 50.00),
('Descuento Fidelidad', 'Descuento especial por clientes frecuentes', 30.00),
('Cupón Tecnología', 'Cupón válido para productos tecnológicos', 100.00),
('Bono Eco', 'Recompensa por uso de productos sostenibles', 75.00),
('Premio Educación', 'Recompensa por cursos y talleres completados', 60.00),
('Bono Salud', 'Descuento en productos de salud', 40.00),
('Recompensa Navideña', 'Premio especial de Navidad', 120.00),
('Bono Black Friday', 'Descuento durante Black Friday', 150.00),
('Premio Innovación', 'Por participación en proyectos innovadores', 90.00),
('Cupón Navidad Verde', 'Recompensa en productos sostenibles de Navidad', 80.00);

INSERT INTO MATERIAL (nom_mat, descr_mat, factor_co2)
VALUES
('Acero', 'Acero de construcción de alta calidad', 1.8500),
('Aluminio', 'Aluminio reciclable para estructuras', 8.5000),
('Madera', 'Madera tratada para construcción', 0.4500),
('Vidrio', 'Vidrio templado para ventanas', 1.1500),
('Plástico PET', 'Plástico PET reciclable', 2.2000),
('Cemento', 'Cemento Portland de alta resistencia', 0.9000),
('Ladrillo', 'Ladrillo cerámico para construcción', 0.8000),
('Cartón', 'Cartón reciclable para embalaje', 0.3000),
('Papel', 'Papel reciclado para oficina', 0.2000),
('Hormigón', 'Hormigón premezclado para construcción', 1.7000);


INSERT INTO LOGRO (titulo_logro, descr_logro, progreso, estado_logro, icono_logro, calidad_logro)
VALUES
('Más limpio que la conciencia', '#', 0.00, 'permanente', 0x, 'Comun'),
('Mi primera vez...', '#', 0.00, 'temporal', 0x, 'Especial'),
('Bienvenido al increible mundo de MRRR', '#', 0.00, 'permanente', 0x, 'Epico'),
('Por los niños esclavos de China', '#', 0.00, 'temporal', 0x, 'Comun'),
('Hace frio aquí en la cima', '#', 0.00, 'permanente', 0x, 'Legendario'),
('Billetera mata a galán', '#', 0.00, 'temporal', 0x, 'Especial'),
('Quiero digievolucionar', '#', 0.00, 'permanente', 0x, 'Legendario'),
('Empieza por agarrar una pala', '#', 0.00, 'temporal', 0x, 'Epico'),
('El bueno, el malo y el barato', '#', 0.00, 'permanente', 0x, 'Especial'),
('Hago más que un influencer', '#', 0.00, 'temporal', 0x, 'Legendario');


INSERT INTO CATEGORIA (nom_cat, descr_cat, imagen_repr, tipo_cat)
VALUES
('Electrónica', 'Dispositivos electrónicos y gadgets', 0x, 'Producto'),
('Ropa', 'Prendas de vestir y accesorios', 0x, 'Producto'),
('Alimentos', 'Productos alimenticios y bebidas', 0x, 'Producto'),
('Muebles', 'Muebles y artículos de decoración', 0x, 'Producto');

INSERT INTO CATEGORIA (nom_cat, descr_cat, imagen_repr, tipo_cat)
VALUES
('Consultoría', 'Servicios de asesoría profesional', 0x, 'Servicio'),
('Transporte', 'Servicios de transporte y logística', 0x, 'Servicio'),
('Educación', 'Cursos, talleres y formación', 0x, 'Servicio'),
('Salud', 'Servicios médicos y de bienestar', 0x, 'Servicio');

INSERT INTO SUBCATEGORIA_PRODUCTO (cod_cat, nom_subcat_prod, descr_subcat_prod, imagen_representativa)
VALUES
(1, 'Smartphones', 'Teléfonos inteligentes de diversas marcas', 'smartphones.jpg'),
(1, 'Computadoras', 'Laptops y PCs de escritorio', 'computadoras.jpg');

INSERT INTO SUBCATEGORIA_PRODUCTO (cod_cat, nom_subcat_prod, descr_subcat_prod, imagen_representativa)
VALUES
(2, 'Hombres', 'Ropa para hombres', 'ropa_hombres.jpg'),
(2, 'Mujeres', 'Ropa para mujeres', 'ropa_mujeres.jpg');

INSERT INTO SUBCATEGORIA_PRODUCTO (cod_cat, nom_subcat_prod, descr_subcat_prod, imagen_representativa)
VALUES
(3, 'Bebidas', 'Bebidas alcohólicas y no alcohólicas', 'bebidas.jpg'),
(3, 'Snacks', 'Aperitivos y golosinas', 'snacks.jpg');

INSERT INTO SUBCATEGORIA_PRODUCTO (cod_cat, nom_subcat_prod, descr_subcat_prod, imagen_representativa)
VALUES
(4, 'Sofás', 'Sofás y sillones de sala', 'sofas.jpg'),
(4, 'Mesas', 'Mesas de comedor y escritorio', 'mesas.jpg');


INSERT INTO SERVICIO (cod_cat, nom_serv, desc_serv, estado_serv, precio_serv, duracion_serv, dif_dist_serv)
VALUES
(5, 'Consultoría Financiera Personal', 'Asesoría financiera para individuos', 'disponible', 150.00, 2, 0.0),
(5, 'Consultoría Legal Empresarial', 'Asesoría legal para empresas', 'disponible', 300.00, 3, 0.0);

INSERT INTO SERVICIO (cod_cat, nom_serv, desc_serv, estado_serv, precio_serv, duracion_serv, dif_dist_serv)
VALUES
(6, 'Servicio de Taxi', 'Transporte urbano eficiente', 'disponible', 5.00, 1, 0.0),
(6, 'Mudanza Local', 'Transporte de muebles y enseres', 'disponible', 50.00, 4, 0.0);

INSERT INTO SERVICIO (cod_cat, nom_serv, desc_serv, estado_serv, precio_serv, duracion_serv, dif_dist_serv)
VALUES
(7, 'Curso de Inglés Básico', 'Curso para aprender inglés desde cero', 'disponible', 120.00, 20, 0.0),
(7, 'Capacitación en Informática', 'Aprende herramientas ofimáticas y software', 'disponible', 100.00, 15, 0.0);

INSERT INTO SERVICIO (cod_cat, nom_serv, desc_serv, estado_serv, precio_serv, duracion_serv, dif_dist_serv)
VALUES
(8, 'Consulta Médica General', 'Atención médica básica', 'disponible', 50.00, 1, 0.0),
(8, 'Entrenamiento Personal', 'Sesiones de entrenamiento físico', 'disponible', 40.00, 1, 0.0);




INSERT INTO PRODUCTO (cod_subcat_prod, nom_prod, peso_prod, calidad_prod, estado_prod, precio_prod, marca_prod, desc_prod)
VALUES
(1, 'Smartphone Galaxy S25', 0.25, 'nuevo', 'disponible', 1200.00, 'Samsung', 'Último modelo Galaxy S25 con cámara avanzada'),
(1, 'iPhone 16', 0.22, 'nuevo', 'disponible', 1300.00, 'Apple', 'Nuevo iPhone 16 con iOS 20');

INSERT INTO PRODUCTO (cod_subcat_prod, nom_prod, peso_prod, calidad_prod, estado_prod, precio_prod, marca_prod, desc_prod)
VALUES
(2, 'Laptop Dell XPS 15', 2.0, 'nuevo', 'disponible', 1800.00, 'Dell', 'Laptop potente para trabajo y gaming'),
(2, 'MacBook Pro 16', 2.1, 'nuevo', 'disponible', 2500.00, 'Apple', 'MacBook Pro con chip M3');


INSERT INTO PRODUCTO (cod_subcat_prod, nom_prod, peso_prod, calidad_prod, estado_prod, precio_prod, marca_prod, desc_prod)
VALUES
(3, 'Camisa Casual', 0.3, 'nuevo', 'disponible', 35.00, 'Zara', 'Camisa de algodón para uso diario'),
(3, 'Pantalón Jeans', 0.5, 'nuevo', 'disponible', 50.00, 'Levi', 'Pantalón clásico de mezclilla');

INSERT INTO PRODUCTO (cod_subcat_prod, nom_prod, peso_prod, calidad_prod, estado_prod, precio_prod, marca_prod, desc_prod)
VALUES
(4, 'Blusa Elegante', 0.25, 'nuevo', 'disponible', 40.00, 'H&M', 'Blusa para oficina y eventos'),
(4, 'Falda Larga', 0.4, 'nuevo', 'disponible', 45.00, 'Forever 21', 'Falda larga de tela ligera');

INSERT INTO PRODUCTO (cod_subcat_prod, nom_prod, peso_prod, calidad_prod, estado_prod, precio_prod, marca_prod, desc_prod)
VALUES
(5, 'Jugo Natural 1L', 1.0, 'nuevo', 'disponible', 5.50, 'Del Valle', 'Jugo natural de frutas variadas'),
(5, 'Agua Mineral 500ml', 0.5, 'nuevo', 'disponible', 1.20, 'Cielo', 'Agua mineral pura y fresca');

INSERT INTO PRODUCTO (cod_subcat_prod, nom_prod, peso_prod, calidad_prod, estado_prod, precio_prod, marca_prod, desc_prod)
VALUES
(6, 'Galletas Integrales', 0.3, 'nuevo', 'disponible', 3.50, 'Natures', 'Galletas saludables integrales'),
(6, 'Chocolates Mix', 0.25, 'nuevo', 'disponible', 4.00, 'Nestlé', 'Paquete de chocolates surtidos');

INSERT INTO PRODUCTO (cod_subcat_prod, nom_prod, peso_prod, calidad_prod, estado_prod, precio_prod, marca_prod, desc_prod)
VALUES
(7, 'Sofá 3 Plazas', 30.0, 'nuevo', 'disponible', 500.00, 'Ikea', 'Sofá cómodo de 3 plazas'),
(7, 'Sillón Individual', 15.0, 'nuevo', 'disponible', 250.00, 'Ikea', 'Sillón reclinable individual');

INSERT INTO PRODUCTO (cod_subcat_prod, nom_prod, peso_prod, calidad_prod, estado_prod, precio_prod, marca_prod, desc_prod)
VALUES
(8, 'Mesa de Comedor 6 Personas', 40.0, 'nuevo', 'disponible', 450.00, 'Homecenter', 'Mesa de madera para 6 personas'),
(8, 'Mesa de Escritorio', 20.0, 'nuevo', 'disponible', 200.00, 'Homecenter', 'Mesa funcional para oficina o estudio');


INSERT INTO PROMOCION_PRODUCTO (id_prod, cod_prom)
VALUES
(1, 1),  
(3, 2),  
(5, 3), 
(7, 4);  

INSERT INTO RECOMPENSA (titulo_rec, desc_rec, monto_rec)
VALUES
('Logro Común', 'Recompensa por logro común', 100.00),
('Logro Especial', 'Recompensa por logro especial', 500.00),
('Logro Épico', 'Recompensa por logro épico', 850.00),
('Logro Legendario', 'Recompensa por logro legendario', 1200.00);

INSERT INTO RECOMPENSA_LOGRO (cod_logro, cod_rec)
VALUES
(1, 11),
(4, 11),
(7, 11);

INSERT INTO RECOMPENSA_LOGRO (cod_logro, cod_rec)
VALUES
(2, 12),
(6, 12),
(9, 12);

INSERT INTO RECOMPENSA_LOGRO (cod_logro, cod_rec)
VALUES
(3, 13),
(8, 13);

INSERT INTO RECOMPENSA_LOGRO (cod_logro, cod_rec)
VALUES
(5, 14),
(10, 14);


INSERT INTO PROMOCION_SERVICIO (id_serv, cod_prom)
VALUES
(1, 1),  
(5, 3);  

INSERT INTO MATERIAL_PRODUCTO (id_mat, id_prod) VALUES
(2, 1),
(4, 1),
(5, 1),
(2, 2),
(4, 2),
(5, 2);

INSERT INTO MATERIAL_PRODUCTO (id_mat, id_prod) VALUES
(2, 3),
(4, 3),
(5, 3),
(2, 4),
(4, 4),
(5, 4);

INSERT INTO MATERIAL_PRODUCTO (id_mat, id_prod) VALUES
(8, 5),
(9, 5),
(8, 6),
(9, 6);

INSERT INTO MATERIAL_PRODUCTO (id_mat, id_prod) VALUES
(8, 7),
(9, 7),
(8, 8),
(9, 8);

INSERT INTO MATERIAL_PRODUCTO (id_mat, id_prod) VALUES
(5, 9),
(8, 9),
(5, 10),
(8, 10);

INSERT INTO MATERIAL_PRODUCTO (id_mat, id_prod) VALUES
(5, 11),
(8, 11),
(5, 12),
(8, 12);

INSERT INTO MATERIAL_PRODUCTO (id_mat, id_prod) VALUES
(3, 13),
(1, 13),
(3, 14),
(1, 14);

INSERT INTO MATERIAL_PRODUCTO (id_mat, id_prod) VALUES
(3, 15),
(1, 15),
(4, 15),
(3, 16),
(1, 16),
(4, 16);

/*INSERT INTO EVENTO (id_org, titulo_evento, descripcion_evento, fecha_registro_evento, fecha_inicio_evento, fecha_finalizacion_evento, duracion_evento, banner_evento, cant_personas_inscritas, ganancia_evento, estado_evento)
VALUES
(1, 'Lanzamiento Producto Estrella', 'Evento de lanzamiento con promociones especiales y regalos', '2025-05-01 10:00:00', '2025-06-01', '2025-06-02', 2, 'lanzamiento_producto.jpg', 300, 'monetizable', 'finalizado'),
(2, 'Campaña Summer Sale', 'Evento promocional con descuentos de verano en productos seleccionados', '2025-04-15 09:00:00', '2025-07-01', '2025-07-15', 15, 'summer_sale.jpg', 500, 'monetizable', 'finalizado'),
(3, 'Pop-up Store Marketing', 'Evento temporal de venta directa y experiencias interactivas', '2025-09-10 08:00:00', '2025-10-05', '2025-10-06', 2, 'popup_store.jpg', 150, 'gratuito', 'vigente');*/

/*FALTA EVENTO RECOMEPNSA */

INSERT INTO ACCESO (id_us, estado_acc, fecha_acc, contra_acc)
VALUES
(1, 'exitoso', '2025-10-10 08:15:00', 'pass12345A'),
(1, 'logout', '2025-10-10 12:30:00', 'pass12345A'),
(2, 'exitoso', '2025-10-11 09:20:00', 'mipass2025B'),
(3, 'no exitoso', '2025-10-12 07:50:00', 'claveSeguraC'),
(4, 'exitoso', '2025-10-12 10:10:00', 'miContraD'),
(5, 'logout', '2025-10-13 11:00:00', 'seguraE123'),
(6, 'exitoso', '2025-10-14 09:45:00', 'passF2025'),
(7, 'exitoso', '2025-10-14 14:20:00', 'claveG'),
(8, 'no exitoso', '2025-10-15 08:30:00', 'miPassH'),
(9, 'exitoso', '2025-10-15 10:50:00', 'seguraI'),
(10, 'logout', '2025-10-16 09:00:00', 'passJ'),
(11, 'exitoso', '2025-10-16 11:15:00', 'contraK'),
(12, 'exitoso', '2025-10-16 13:30:00', 'claveL'),
(13, 'no exitoso', '2025-10-16 14:40:00', 'miPassM'),
(14, 'exitoso', '2025-10-17 08:05:00', 'passN'),
(15, 'logout', '2025-10-17 09:20:00', 'contraO');

INSERT INTO DISPONIBILIDAD (id_us, hora_ini, hora_fin, fecha_dia)
VALUES
(5, '09:00', '12:00', '2025-10-20'),
(5, '14:00', '18:00', '2025-10-20'),
(6, '08:00', '11:00', '2025-10-21'),
(6, '13:00', '16:00', '2025-10-21'),
(7, '10:00', '13:00', '2025-10-22'),
(7, '15:00', '19:00', '2025-10-22'),
(8, '09:30', '12:30', '2025-10-23'),
(8, '14:00', '17:00', '2025-10-23'),
(9, '08:30', '11:30', '2025-10-24'),
(9, '13:00', '16:00', '2025-10-24'),
(10, '09:00', '12:00', '2025-10-25'),
(10, '13:30', '17:00', '2025-10-25'),
(11, '08:00', '11:00', '2025-10-26'),
(11, '12:30', '15:30', '2025-10-26'),
(12, '09:00', '12:00', '2025-10-27'),
(12, '14:00', '18:00', '2025-10-27'),
(13, '10:00', '13:00', '2025-10-28'),
(13, '14:30', '17:30', '2025-10-28'),
(14, '08:00', '11:00', '2025-10-29'),
(14, '12:30', '15:30', '2025-10-29'),
(15, '09:00', '12:00', '2025-10-30'),
(15, '13:30', '17:00', '2025-10-30');


INSERT INTO PUBLICACION (id_us, fecha_ini_pub, fecha_fin_pub, foto_pub, calif_pond_pub, impacto_amb_pub)
VALUES
(1, '2025-09-01', '2025-09-10', 0x, 4.5, 12.30),
(2, '2025-09-05', '2025-09-12', 0x, 4.0, 8.50),
(3, '2025-09-08', '2025-09-15', 0x, 3.8, 10.20),
(4, '2025-09-10', '2025-09-20', 0x, 4.2, 9.10),
(5, '2025-09-12', '2025-09-18', 0x, 4.7, 11.50),
(6, '2025-09-15', '2025-09-22', 0x, 4.1, 7.80),
(7, '2025-09-18', '2025-09-25', 0x, 3.9, 9.50),
(8, '2025-09-20', '2025-09-28', 0x, 4.3, 10.00),
(9, '2025-09-22', '2025-09-30', 0x, 4.0, 8.90),
(10, '2025-09-25', '2025-10-02', 0x, 4.6, 12.00);


INSERT INTO CALIFICACIONES_PUBLICACION (cod_pub, id_us, calif_pub)
VALUES
(1, 2, 4.0),
(1, 3, 4.5),
(2, 1, 3.8),
(2, 4, 4.2),
(3, 5, 4.0),
(3, 6, 3.9),
(4, 7, 4.3),
(4, 8, 4.1),
(5, 9, 4.7),
(5, 10, 4.5),
(6, 11, 4.2),
(6, 12, 4.0),
(7, 13, 3.8),
(7, 14, 4.1),
(8, 15, 4.4),
(8, 1, 4.2),
(9, 2, 4.0),
(9, 3, 3.9),
(10, 4, 4.5),
(10, 5, 4.6);


INSERT INTO USUARIO_LOGRO (id_us, fechaObtencion_logro)
VALUES
(1, '2025-10-01 10:00:00'),
(1, '2025-10-05 12:30:00'),
(2, '2025-10-02 09:15:00'),
(3, '2025-10-03 14:20:00'),
(3, '2025-10-06 11:10:00'),
(4, '2025-10-04 08:50:00'),
(5, '2025-10-05 15:40:00'),
(6, '2025-10-06 10:30:00'),
(6, '2025-10-07 13:20:00');

INSERT INTO PUBLICACION_PRODUCTO (cod_pub, id_prod, cant_prod, unidad_medida)
VALUES
(1, 1, 10, 'unidad'),
(2, 2, 5, 'unidad'),
(3, 3, 20, 'unidad'),
(4, 4, 15, 'unidad');


INSERT INTO PUBLICACION_SERVICIO (cod_pub, id_serv, hrs_ini_dia_serv, hrs_fin_dia_serv)
VALUES
(1, 1, '09:00:00', '11:00:00'),
(2, 2, '10:00:00', '12:00:00'),
(3, 3, '13:00:00', '15:00:00'),
(4, 4, '14:00:00', '16:00:00'),
(5, 5, '08:30:00', '10:30:00');
/* ESPERAR A LA CREACION DE EVENTO
INSERT INTO TRANSACCION (id_us_origen, id_us_destino, cod_pub, cod_evento, desc_trans, fecha_trans, moneda, monto_regalo, estado_trans)
VALUES
(1, 2, 1, 1, 'Regalo por compra de promoción', '2025-10-01 10:00:00', 'creditos v', 50.00, 'satisfactorio'),
(2, 3, 2, 1, 'Pago por servicio recibido', '2025-10-02 11:15:00', 'creditos v', 75.00, 'satisfactorio'),
(3, 4, 3, 2, 'Intercambio de producto', '2025-10-03 12:30:00', 'creditos v', 20.00, 'satisfactorio'),
(4, 5, 4, 1, 'Entrada a evento lanzamiento', '2025-10-04 09:45:00', 'creditos v', 100.00, 'satisfactorio'),
(5, 6, 5, 3, 'Pago por compra online', '2025-10-05 14:10:00', 'creditos v', 35.00, 'satisfactorio'),
(6, 7, 6, 2, 'Entrada a campaña Summer Sale', '2025-10-06 16:20:00', 'creditos v', 60.00, 'satisfactorio'),
(7, 8, 7, 2, 'Regalo por fidelidad', '2025-10-07 08:30:00', 'creditos v', 40.00, 'satisfactorio'),
(8, 9, 8, 3, 'Acceso a pop-up store', '2025-10-08 10:50:00', 'creditos v', 80.00, 'satisfactorio');
*/

INSERT INTO POTENCIADOR (cod_trans, nombre_potenciador, precio_potenciador, descripcion_potenciador, multiplicador_potenciador, fecha_inicio_potenciador, fecha_finalizacion_potenciador, duracion_potenciador, nivel_potenciador)
VALUES
(NULL, 'Boost Verde', 25.00, 'Aumenta el valor de la transacción en un 20%', 1.20, '2025-10-01 10:00:00', '2025-10-03 10:00:00', 2, 1),
(NULL, 'Eco Multiplicador', 50.00, 'Duplica los créditos verdes de la transacción', 2.00, '2025-10-02 09:00:00', '2025-10-04 09:00:00', 2, 2),
(NULL, 'Promoción Premium', 35.00, 'Incrementa el impacto ambiental positivo', 1.50, '2025-10-03 12:00:00', '2025-10-05 12:00:00', 2, 1),
(NULL, 'Verde Plus', 45.00, 'Mejora el multiplicador de la transacción', 1.75, '2025-10-04 14:00:00', '2025-10-06 14:00:00', 2, 2),
(NULL, 'Eco Boost', 30.00, 'Aumenta la cantidad de vcréditos verdes recibidos', 1.25, '2025-10-05 08:30:00', '2025-10-07 08:30:00', 2, 1),
(NULL, 'Power Verde', 60.00, 'Maximiza la transacción y nivel de efecto', 2.50, '2025-10-06 15:00:00', '2025-10-08 15:00:00', 2, 3);


INSERT INTO CONTRASENIA (id_us, fecha_camb, correo_acc, contra_prev, contra_nueva)
VALUES
(1, '2025-10-01 09:30:00', 'juan.carlos@mail.com', 'contra123', 'Contra1234!'),
(2, '2025-10-02 10:15:00', 'maria.fernanda@mail.com', 'clave456', 'Clave456!'),
(3, '2025-10-03 11:00:00', 'luis.alberto@mail.com', 'password1', 'Password1!'),
(4, '2025-10-04 08:45:00', 'ana.sofia@mail.com', 'pass789', 'Pass789!'),
(5, '2025-10-05 12:20:00', 'pedro.miguel@mail.com', 'clave789', 'Clave789!'),
(6, '2025-10-06 14:10:00', 'gabriela.andrea@mail.com', 'gaby123', 'Gaby123!'),
(7, '2025-10-07 15:00:00', 'carlos.eduardo@mail.com', 'edu456', 'Edu456!');

INSERT INTO USUARIO_ADVERTENCIA (cod_adv, id_us)
VALUES
(1, 5),
(2, 9),
(3, 12);



INSERT INTO INTERCAMBIO (id_prod, id_us_origen, id_us_destino, cant_prod, unidad_medida, foto_inter, impacto_amb_inter)
VALUES
(1, 9, 1, 1, 'unidad', 0x, 12.50),
(2, 10, 2, 2, 'unidad', 0x, 8.30),
(3, 5, 3, 3, 'unidad', 0x, 5.75),
(4, 6, 4, 1, 'unidad', 0x, 6.20),
(7, 11, 5, 1, 'unidad', 0x, 25.00),
(8, 12, 6, 2, 'unidad', 0x, 18.40);


INSERT INTO PUBLICACION_LOGRO (cod_pub, cod_logro)
VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);


INSERT INTO PUBLICACION_PROMOCION (cod_pub, cod_prom)
VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO EVENTO (id_org, titulo_evento, descripcion_evento, fecha_registro_evento, fecha_inicio_evento, fecha_finalizacion_evento, duracion_evento, banner_evento, cant_personas_inscritas, ganancia_evento,tipo_evento, estado_evento)
VALUES
(1, 'Lanzamiento Producto Estrella', 'Evento de lanzamiento con promociones especiales y regalos', '2025-05-01 10:00:00', '2025-06-01', '2025-06-02', 2, 'lanzamiento_producto.jpg', 300, 300000.0,'BENEFICO', 'finalizado'),
(2, 'Campaña Summer Sale', 'Evento promocional con descuentos de verano en productos seleccionados', '2025-04-15 09:00:00', '2025-07-01', '2025-07-15', 15, 'summer_sale.jpg', 500, 20000.0,'MONETIZABLE', 'finalizado'),
(3, 'Pop-up Store Marketing', 'Evento temporal de venta directa y experiencias interactivas', '2025-09-10 08:00:00', '2025-10-05', '2025-10-06', 2, 'popup_store.jpg', 150, 10000.0,'BENEFICO', 'vigente');


INSERT INTO USUARIO_EVENTO (cod_evento, id_us)
VALUES
(4, 1),
(4, 2),
(5, 3),
(5, 4),
(3, 5),
(3, 6);

/*FALTA EVENTO RECOMEPNSA */


/*esperar  transaccion
INSERT INTO BITACORA (cod_acc, cod_trans, cod_camb)
VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4),
(5, 5, 5);*/

--No me deja insertar los datos de ACCESO, me dice invalid object name
/*INSERT INTO ACCESO (id_us, estado_acc, fecha_acc, contra_acc)
VALUES
(1, 'exitoso', '2025-10-10 08:15:00', 'pass12345A'),
(1, 'logout', '2025-10-10 12:30:00', 'pass12345A'),
(2, 'exitoso', '2025-10-11 09:20:00', 'mipass2025B'),
(3, 'no exitoso', '2025-10-12 07:50:00', 'claveSeguraC'),
(4, 'exitoso', '2025-10-12 10:10:00', 'miContraD'),
(5, 'logout', '2025-10-13 11:00:00', 'seguraE123'),
(6, 'exitoso', '2025-10-14 09:45:00', 'passF2025'),
(7, 'exitoso', '2025-10-14 14:20:00', 'claveG'),
(8, 'no exitoso', '2025-10-15 08:30:00', 'miPassH'),
(9, 'exitoso', '2025-10-15 10:50:00', 'seguraI'),
(10, 'logout', '2025-10-16 09:00:00', 'passJ'),
(11, 'exitoso', '2025-10-16 11:15:00', 'contraK'),
(12, 'exitoso', '2025-10-16 13:30:00', 'claveL'),
(13, 'no exitoso', '2025-10-16 14:40:00', 'miPassM'),
(14, 'exitoso', '2025-10-17 08:05:00', 'passN'),
(15, 'logout', '2025-10-17 09:20:00', 'contraO');*/