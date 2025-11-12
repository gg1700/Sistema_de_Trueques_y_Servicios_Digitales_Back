-- =========================================
-- REPORTE: Usuarios por Acción
-- =========================================
-- Descripción:
-- Reporta cantidad de usuarios por tipo de acción realizada
CREATE OR REPLACE FUNCTION sp_reporteUsuariosPorAccion(
  _p_fecha_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  _p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  tipo_accion VARCHAR,
  cantidad_usuarios BIGINT,
  total_acciones BIGINT,
  promedio_por_usuario DECIMAL(10,2)
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  -- Publicaciones
  SELECT 
  'Publicar'::VARCHAR as tipo_accion,
  COUNT(DISTINCT p.cod_us) as cantidad_usuarios,
  COUNT(p.cod_pub) as total_acciones,
  ROUND(COUNT(p.cod_pub)::DECIMAL / NULLIF(COUNT(DISTINCT p.cod_us), 0), 2) as promedio_por_usuario
  FROM publicacion p
  WHERE p.fecha_ini_pub BETWEEN _p_fecha_inicio AND _p_fecha_fin

  UNION ALL

  -- Intercambios (como proveedor)
  SELECT 
  'Intercambiar'::VARCHAR,
  COUNT(DISTINCT i.cod_us_1),
  COUNT(i.cod_inter),
  ROUND(COUNT(i.cod_inter)::DECIMAL / NULLIF(COUNT(DISTINCT i.cod_us_1), 0), 2)
  FROM intercambio i
  JOIN bitacora b ON b.cod_inter = i.cod_inter
  JOIN transaccion t ON t.cod_trans = b.cod_trans
  WHERE t.fecha_trans BETWEEN _p_fecha_inicio AND _p_fecha_fin

  UNION ALL

  -- Compra de potenciadores
  SELECT 
  'Compra Potenciadores'::VARCHAR,
  COUNT(DISTINCT t.cod_us_origen),
  COUNT(t.cod_trans),
  ROUND(COUNT(t.cod_trans)::DECIMAL / NULLIF(COUNT(DISTINCT t.cod_us_origen), 0), 2)
  FROM transaccion t
  WHERE t.cod_potenciador IS NOT NULL
  AND t.fecha_trans BETWEEN _p_fecha_inicio AND _p_fecha_fin

  UNION ALL

  -- Participación en eventos
  SELECT 
  'Participar Eventos'::VARCHAR,
  COUNT(DISTINCT ue.cod_us),
  COUNT(*),
  ROUND(COUNT(*)::DECIMAL / NULLIF(COUNT(DISTINCT ue.cod_us), 0), 2)
  FROM usuario_evento ue
  JOIN evento e ON ue.cod_evento = e.cod_evento
  WHERE e.fecha_registro_evento BETWEEN _p_fecha_inicio AND _p_fecha_fin

  UNION ALL

  -- Transacciones generales
  SELECT 
  'Transacciones'::VARCHAR,
  COUNT(DISTINCT t.cod_us_origen),
  COUNT(t.cod_trans),
  ROUND(COUNT(t.cod_trans)::DECIMAL / NULLIF(COUNT(DISTINCT t.cod_us_origen), 0), 2)
  FROM transaccion t
  WHERE t.fecha_trans BETWEEN _p_fecha_inicio AND _p_fecha_fin;
END;
$$;

-- =========================================
-- REPORTE: Impacto Ambiental de la Plataforma
-- =========================================
-- Descripción:
-- Calcula el CO2 total eliminado por mes
CREATE OR REPLACE FUNCTION sp_reporteImpactoAmbientalPlataforma(
  _p_anio INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE(
  mes INTEGER,
  nombre_mes VARCHAR,
  total_co2_eliminado DECIMAL(12,2),
  cantidad_publicaciones BIGINT,
  cantidad_usuarios_activos BIGINT,
  promedio_co2_usuario DECIMAL(12,2)
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH meses AS (
    SELECT generate_series(1, 12) as mes_num
  ),
  datos_mes AS (
    SELECT 
    EXTRACT(MONTH FROM p.fecha_ini_pub)::INTEGER as mes,
    SUM(p.impacto_amb_pub) as co2_total,
    COUNT(p.cod_pub) as cant_publicaciones,
    COUNT(DISTINCT p.cod_us) as cant_usuarios
    FROM publicacion p
    WHERE EXTRACT(YEAR FROM p.fecha_ini_pub) = _p_anio
    AND p.impacto_amb_pub > 0
    GROUP BY EXTRACT(MONTH FROM p.fecha_ini_pub)
  )
  SELECT 
  m.mes_num,
  CASE m.mes_num
  WHEN 1 THEN 'Enero'
  WHEN 2 THEN 'Febrero'
  WHEN 3 THEN 'Marzo'
  WHEN 4 THEN 'Abril'
  WHEN 5 THEN 'Mayo'
  WHEN 6 THEN 'Junio'
  WHEN 7 THEN 'Julio'
  WHEN 8 THEN 'Agosto'
  WHEN 9 THEN 'Septiembre'
  WHEN 10 THEN 'Octubre'
  WHEN 11 THEN 'Noviembre'
  WHEN 12 THEN 'Diciembre'
  END::VARCHAR as nombre_mes,
  COALESCE(d.co2_total, 0) as total_co2_eliminado,
  COALESCE(d.cant_publicaciones, 0) as cantidad_publicaciones,
  COALESCE(d.cant_usuarios, 0) as cantidad_usuarios_activos,
  ROUND(COALESCE(d.co2_total, 0) / NULLIF(COALESCE(d.cant_usuarios, 0), 0), 2) as promedio_co2_usuario
  FROM meses m
  LEFT JOIN datos_mes d ON m.mes_num = d.mes
  ORDER BY m.mes_num;
END;
$$;

-- =========================================
-- REPORTE: Compras en Tienda (Potenciadores)
-- =========================================
-- Descripción:
-- Reporta las compras de potenciadores por mes
CREATE OR REPLACE FUNCTION sp_reporteComprasTienda(
  _p_anio INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE(
  mes INTEGER,
  nombre_mes VARCHAR,
  tipo_producto VARCHAR,
  nombre_producto VARCHAR,
  cantidad_ventas BIGINT,
  ingresos_totales DECIMAL(12,2),
  ingresos_promedio DECIMAL(12,2)
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH meses AS (
    SELECT generate_series(1, 12) as mes_num
  ),
  ventas_potenciadores AS (
    SELECT 
    EXTRACT(MONTH FROM t.fecha_trans)::INTEGER as mes,
    'Potenciador'::VARCHAR as tipo,
    p.nombre_potenciador,
    COUNT(t.cod_trans) as ventas,
    SUM(p.precio_potenciador) as total_ingresos
    FROM transaccion t
    JOIN potenciador p ON t.cod_potenciador = p.cod_potenciador
    WHERE EXTRACT(YEAR FROM t.fecha_trans) = _p_anio
    AND t.estado_trans = 'satisfactorio'
    GROUP BY EXTRACT(MONTH FROM t.fecha_trans), p.nombre_potenciador
  ),
  eventos_pagados AS (
    SELECT 
    EXTRACT(MONTH FROM t.fecha_trans)::INTEGER as mes,
    'Inscripción Evento'::VARCHAR as tipo,
    e.titulo_evento,
    COUNT(t.cod_trans) as ventas,
    SUM(e.costo_inscripcion) as total_ingresos
    FROM transaccion t
    JOIN evento e ON t.cod_evento = e.cod_evento
    WHERE EXTRACT(YEAR FROM t.fecha_trans) = _p_anio
    AND e.costo_inscripcion > 0
    AND t.estado_trans = 'satisfactorio'
    GROUP BY EXTRACT(MONTH FROM t.fecha_trans), e.titulo_evento
  )
  SELECT 
  m.mes_num,
  CASE m.mes_num
  WHEN 1 THEN 'Enero'
  WHEN 2 THEN 'Febrero'
  WHEN 3 THEN 'Marzo'
  WHEN 4 THEN 'Abril'
  WHEN 5 THEN 'Mayo'
  WHEN 6 THEN 'Junio'
  WHEN 7 THEN 'Julio'
  WHEN 8 THEN 'Agosto'
  WHEN 9 THEN 'Septiembre'
  WHEN 10 THEN 'Octubre'
  WHEN 11 THEN 'Noviembre'
  WHEN 12 THEN 'Diciembre'
  END::VARCHAR,
  COALESCE(v.tipo, 'Sin ventas')::VARCHAR,
  COALESCE(v.nombre_potenciador, 'N/A')::VARCHAR,
  COALESCE(v.ventas, 0),
  COALESCE(v.total_ingresos, 0),
  ROUND(COALESCE(v.total_ingresos, 0) / NULLIF(COALESCE(v.ventas, 0), 0), 2)
  FROM meses m
  LEFT JOIN ventas_potenciadores v ON m.mes_num = v.mes

  UNION ALL

  SELECT 
  m.mes_num,
  CASE m.mes_num
  WHEN 1 THEN 'Enero'
  WHEN 2 THEN 'Febrero'
  WHEN 3 THEN 'Marzo'
  WHEN 4 THEN 'Abril'
  WHEN 5 THEN 'Mayo'
  WHEN 6 THEN 'Junio'
  WHEN 7 THEN 'Julio'
  WHEN 8 THEN 'Agosto'
  WHEN 9 THEN 'Septiembre'
  WHEN 10 THEN 'Octubre'
  WHEN 11 THEN 'Noviembre'
  WHEN 12 THEN 'Diciembre'
  END::VARCHAR,
  COALESCE(e.tipo, 'Sin ventas')::VARCHAR,
  COALESCE(e.titulo_evento, 'N/A')::VARCHAR,
  COALESCE(e.ventas, 0),
  COALESCE(e.total_ingresos, 0),
  ROUND(COALESCE(e.total_ingresos, 0) / NULLIF(COALESCE(e.ventas, 0), 0), 2)
  FROM meses m
  LEFT JOIN eventos_pagados e ON m.mes_num = e.mes

  ORDER BY mes, tipo_producto;
END;
$$;

-- =========================================
-- REPORTE: Datos de Eventos
-- =========================================
-- Descripción:
-- Reporta usuarios suscritos por evento
CREATE OR REPLACE FUNCTION sp_reporteEventos(
  _p_fecha_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '6 months',
  _p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  cod_evento INTEGER,
  titulo_evento VARCHAR,
  descripcion_evento VARCHAR,
  tipo_evento VARCHAR,
  estado_evento VARCHAR,
  fecha_inicio DATE,
  fecha_fin DATE,
  duracion_dias INTEGER,
  costo_inscripcion DECIMAL(12,2),
  usuarios_inscritos BIGINT,
  ganancia_total DECIMAL(12,2),
  nombre_organizacion VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
  e.cod_evento,
  e.titulo_evento,
  e.descripcion_evento,
  e.tipo_evento::VARCHAR,
  e.estado_evento::VARCHAR,
  e.fecha_inicio_evento,
  e.fecha_finalizacion_evento,
  e.duracion_evento,
  e.costo_inscripcion,
  COUNT(DISTINCT ue.cod_us) as usuarios_inscritos,
  e.ganancia_evento,
  o.nom_com_org
  FROM evento e
  JOIN origanizacion o ON e.cod_org = o.cod_org
  LEFT JOIN usuario_evento ue ON e.cod_evento = ue.cod_evento
  WHERE e.fecha_inicio_evento BETWEEN _p_fecha_inicio AND _p_fecha_fin
  GROUP BY 
  e.cod_evento, e.titulo_evento, e.descripcion_evento, 
  e.tipo_evento, e.estado_evento, e.fecha_inicio_evento,
  e.fecha_finalizacion_evento, e.duracion_evento, 
  e.costo_inscripcion, e.ganancia_evento, o.nom_com_org
  ORDER BY e.fecha_inicio_evento DESC;
END;
$$;
