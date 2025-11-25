import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Corrigiendo stored procedure para eliminar duplicados...");

        // Primero eliminar la función existente
        await prisma.$executeRaw`
      DROP FUNCTION IF EXISTS sp_obtenerEventosPropiosUsuario(integer);
    `;
        console.log("Función anterior eliminada.");

        // Recrear con DISTINCT para evitar duplicados
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
          SELECT DISTINCT ON (e.cod_evento)
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
          ORDER BY e.cod_evento, e.fecha_registro_evento DESC;
      END;
      $$;
    `;
        console.log("✅ sp_obtenerEventosPropiosUsuario actualizado con DISTINCT ON para evitar duplicados.");

    } catch (e) {
        console.error("❌ Error al actualizar:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
