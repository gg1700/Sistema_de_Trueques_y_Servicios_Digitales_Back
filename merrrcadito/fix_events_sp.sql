-- REPORTE 3: EVENTOS POR ORGANIZACIÓN (CORREGIDO)
-- Ejecuta esto en Supabase SQL Editor para reemplazar el procedimiento

CREATE OR REPLACE FUNCTION sp_reporteEventosPorOrganizacion(
    _p_mes INTEGER,
    _p_anio INTEGER
) RETURNS TABLE (
    nom_org VARCHAR,
    titulo_evento VARCHAR,
    tipo_evento VARCHAR,
    fecha_inicio_evento DATE,
    fecha_finalizacion_evento DATE,
    cant_personas_inscritas INTEGER,
    ganancia_evento DECIMAL(12,2),
    costo_inscripcion DECIMAL(12,2),
    estado_evento VARCHAR,
    roi DECIMAL(5,2)
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.nom_com_org,
        e.titulo_evento,
        e.tipo_evento::VARCHAR,
        e.fecha_inicio_evento,
        e.fecha_finalizacion_evento,
        e.cant_personas_inscritas,
        e.ganancia_evento,
        e.costo_inscripcion,
        e.estado_evento::VARCHAR,
        CASE 
            WHEN e.cant_personas_inscritas > 0 AND e.costo_inscripcion > 0
            THEN ((e.ganancia_evento / (e.cant_personas_inscritas * e.costo_inscripcion)) * 100)::DECIMAL(5,2)
            ELSE 0::DECIMAL(5,2)
        END AS roi
    FROM evento e
    INNER JOIN organizacion o ON e.cod_org = o.cod_org  -- CORREGIDO: organizacion en lugar de origanizacion
    WHERE EXTRACT(MONTH FROM e.fecha_inicio_evento) = _p_mes
      AND EXTRACT(YEAR FROM e.fecha_inicio_evento) = _p_anio
    ORDER BY e.ganancia_evento DESC;
END;
$$;
