import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Iniciando creación de stored procedures para recompensas...");

        // 1. Crear sp_obtenerTodasRecompensas
        console.log("Creando sp_obtenerTodasRecompensas...");
        await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION sp_obtenerTodasRecompensas()
      RETURNS TABLE(
          cod_rec INT,
          monto_rec NUMERIC
      ) LANGUAGE plpgsql AS $$
      BEGIN
        RETURN QUERY
          SELECT
              r.cod_rec,
              r.monto_rec
          FROM RECOMPENSA r
          ORDER BY r.monto_rec ASC;
      END;
      $$;
    `;
        console.log("sp_obtenerTodasRecompensas creado.");

        // 2. Actualizar sp_registrarEvento para incluir recompensa
        console.log("Actualizando sp_registrarEvento para incluir recompensa...");
        await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION sp_registrarEvento(
          _p_cod_us INT,
          _p_titulo_evento VARCHAR(100),
          _p_descripcion_evento TEXT,
          _p_fecha_inicio_evento DATE,
          _p_fecha_finalizacion_evento DATE,
          _p_tipo_evento VARCHAR(20),
          _p_banner_evento BYTEA DEFAULT NULL,
          _p_costo_inscripcion NUMERIC(10,2) DEFAULT 0.0,
          _p_cod_rec INT DEFAULT NULL
      ) RETURNS INTEGER LANGUAGE plpgsql AS $$
      DECLARE
          _nuevo_cod_evento INTEGER;
      BEGIN
          INSERT INTO EVENTO(
              cod_org, titulo_evento, descripcion_evento, fecha_registro_evento,
              fecha_inicio_evento, fecha_finalizacion_evento, duracion_evento, 
              tipo_evento, banner_evento, costo_inscripcion
          )
          VALUES(
              NULL, _p_titulo_evento, _p_descripcion_evento, NOW(),
              _p_fecha_inicio_evento, _p_fecha_finalizacion_evento,
              CAST(DATE_PART('day', _p_fecha_finalizacion_evento::timestamp - _p_fecha_inicio_evento::timestamp) AS INTEGER),
              _p_tipo_evento::"EventType", _p_banner_evento, _p_costo_inscripcion
          )
          RETURNING cod_evento INTO _nuevo_cod_evento;
          
          -- Registrar al usuario como creador/organizador del evento
          INSERT INTO USUARIO_EVENTO(cod_evento, cod_us, impacto_amb_inter)
          VALUES(_nuevo_cod_evento, _p_cod_us, 10.0);
          
          -- Si se proporciona una recompensa, vincularla al evento
          IF _p_cod_rec IS NOT NULL THEN
              INSERT INTO EVENTO_RECOMPENSA(cod_evento, cod_rec)
              VALUES(_nuevo_cod_evento, _p_cod_rec);
          END IF;
          
          RETURN _nuevo_cod_evento;
      END;
      $$;
    `;
        console.log("sp_registrarEvento actualizado.");

        // 3. Actualizar sp_obtenerEventosPropiosUsuario para incluir recompensa
        console.log("Actualizando sp_obtenerEventosPropiosUsuario con recompensa...");
        await prisma.$executeRaw`
      DROP FUNCTION IF EXISTS sp_obtenerEventosPropiosUsuario(integer);
    `;

        await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION sp_obtenerEventosPropiosUsuario(
          _p_cod_us INT
      ) RETURNS TABLE(
          cod_evento INT,
          titulo_evento VARCHAR,
          descripcion_evento TEXT,
          fecha_registro_evento TIMESTAMP,
          fecha_inicio_evento DATE,
          fecha_finalizacion_evento DATE,
          duracion_evento INT,
          banner_evento BYTEA,
          cant_personas_inscritas INT,
          ganancia_evento NUMERIC,
          estado_evento VARCHAR,
          tipo_evento VARCHAR,
          costo_inscripcion NUMERIC,
          tiene_banner BOOLEAN,
          monto_recompensa NUMERIC
      ) LANGUAGE plpgsql AS $$
      BEGIN
        RETURN QUERY
          SELECT
              e.cod_evento,
              e.titulo_evento,
              e.descripcion_evento,
              e.fecha_registro_evento,
              e.fecha_inicio_evento,
              e.fecha_finalizacion_evento,
              e.duracion_evento,
              e.banner_evento,
              e.cant_personas_inscritas,
              e.ganancia_evento,
              e.estado_evento::VARCHAR,
              e.tipo_evento::VARCHAR,
              e.costo_inscripcion,
              (e.banner_evento IS NOT NULL) AS tiene_banner,
              COALESCE(r.monto_rec, 0) AS monto_recompensa
          FROM EVENTO e
          INNER JOIN USUARIO_EVENTO ue ON e.cod_evento = ue.cod_evento
          LEFT JOIN EVENTO_RECOMPENSA er ON e.cod_evento = er.cod_evento
          LEFT JOIN RECOMPENSA r ON er.cod_rec = r.cod_rec
          WHERE ue.cod_us = _p_cod_us
          ORDER BY e.fecha_registro_evento DESC;
      END;
      $$;
    `;
        console.log("sp_obtenerEventosPropiosUsuario actualizado.");

        console.log("¡Todos los stored procedures creados exitosamente!");

    } catch (e) {
        console.error("Error al crear procedimientos:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
