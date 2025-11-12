-- INDICES PARA TABLA: USUARIO

-- Insertado
CREATE INDEX idx_usuario_login ON USUARIO (handle_name, contra_us);
COMMENT ON INDEX idx_usuario_login IS 'Optimiza la autenticación de usuarios';

-- Insertado
CREATE INDEX idx_usuario_correo ON USUARIO (correo_us) WHERE estado_us = 'activo';
COMMENT ON INDEX idx_usuario_correo IS 'Búsqueda por email, solo usuario activos';

-- Insertado
CREATE INDEX idx_usuario_ci ON USUARIO(ci);
COMMENT ON INDEX idx_usuario_ci IS 'Verificación rápida de ci';

-- INDICES PARA TABLA: PUBLICACION

-- Insertado y Corregido
CREATE INDEX idx_publicacion_vigentes ON PUBLICACION (fecha_fin_pub) WHERE fecha_fin_pub >= CURRENT_DATE;
COMMENT ON INDEX idx_publicacion_vigentes IS 'Filtra solo publicaciones activas';

-- Insertado
CREATE INDEX idx_publicacion_calificacion ON PUBLICACION (calif_pond_pub DESC) WHERE calif_pond_pub > 0;
COMMENT ON INDEX idx_publicacion_calificacion IS 'Ranking de publicaciones por calificación';

-- Insertado
CREATE INDEX idx_publicacion_co2 ON PUBLICACION (impacto_amb_pub ASC);
COMMENT ON INDEX idx_publicacion_co2 IS 'Ordenar publicaciones por menor huella de carbono';

-- INDICES PARA TABLA: PRODUCTO

-- Insertado
CREATE INDEX idx_producto_subcat ON PRODUCTO (cod_subcat_prod, estado_prod) WHERE estado_prod = 'disponible';
COMMENT ON INDEX idx_producto_subcat IS 'Productos disponibles por subcategoría';

-- Insertado
CREATE INDEX idx_producto_precio ON PRODUCTO (precio_prod);
COMMENT ON INDEX idx_producto_precio IS 'Filtros de rango de precio (ej: entre $10 y $50)';

-- INDICES PARA TABLA: SERVICIO

-- Insertado
CREATE INDEX idx_servicio_categoria ON SERVICIO (cod_cat, estado_serv) WHERE estado_serv = 'disponible';
COMMENT ON INDEX idx_servicio_categoria IS 'Servicios disponibles por categoría';

-- Insertado
CREATE INDEX idx_servicio_precio ON SERVICIO (precio_serv);
COMMENT ON INDEX idx_servicio_precio IS 'Búsqueda rapida por precio de servicio'

-- INDICES PARA TABLA: TRANSACCION

-- Insertado
CREATE INDEX idx_transaccion_estado_fecha ON TRANSACCION (estado_trans, fecha_trans DESC);

-- INDICES PARA TABLA: EVENTO

-- Insertado
CREATE INDEX idx_evento_vigentes ON EVENTO (estado_evento, fecha_inicio_evento) WHERE estado_evento = 'vigente';
COMMENT ON INDEX idx_evento_vigentes IS 'Lista eventos activos ordenados por fecha';

-- Insertado
CREATE INDEX idx_evento_fechas ON EVENTO(fecha_inicio_evento, fecha_finalizacion_evento);

-- INDICES PARA TABLA: ACCESO

-- Insertado
CREATE INDEX idx_acceso_usuario_fecha ON ACCESO (cod_us, fecha_acc DESC);
COMMENT ON INDEX idx_acceso_usuario_fecha IS 'Historial de login de usuario';

-- INDICES PARA TABLA: MATERIAL_PRODUCTO

-- Insertado
CREATE INDEX idx_material_producto_prod ON MATERIAL_PRODUCTO (cod_prod);
COMMENT ON INDEX idx_material_producto_prod IS 'Materiales de un producto (cálculo CO2)';

-- Insertado
CREATE INDEX idx_material_producto_mat ON MATERIAL_PRODUCTO (cod_mat);
COMMENT ON INDEX idx_material_producto_mat IS 'Productos que usan un material';

-- INDICE PARA TABLA: EQUIVALENCIA_CO2

-- Insertado
CREATE INDEX idx_equiv_co2_material_unidades ON EQUIVALENCIA_CO2 (cod_mat, unidad_origen, unidad_destino);
COMMENT ON INDEX idx_equiv_co2_material_unidades IS 'Conversiones rápidas de CO2';
