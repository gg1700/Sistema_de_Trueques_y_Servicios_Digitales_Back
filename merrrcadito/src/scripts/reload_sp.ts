import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Reloading sp_registrarEvento...');
        await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION sp_registrarEvento(
          _p_cod_us INT,
          _p_titulo_evento VARCHAR(100),
          _p_descripcion_evento VARCHAR(200),
          _p_fecha_inicio_evento DATE,
          _p_fecha_finalizacion_evento DATE,
          _p_tipo_evento VARCHAR(20),
          _p_banner_evento BYTEA DEFAULT NULL,
          _p_costo_inscripcion NUMERIC(10,2) DEFAULT 0.0
      ) RETURNS INTEGER LANGUAGE plpgsql AS $$
      DECLARE
          _nuevo_cod_evento INTEGER;
      BEGIN
          INSERT INTO EVENTO(
              cod_org, titulo_evento, descripcion_evento, fecha_registro_evento,
              fecha_inicio_evento, fecha_finalizacion_evento, duracion_evento, 
              tipo_evento, banner_evento, costo_inscripcion, cod_us_creador, impacto_amb_inter
          )
          VALUES(
              NULL, _p_titulo_evento, _p_descripcion_evento, NOW(),
              _p_fecha_inicio_evento, _p_fecha_finalizacion_evento,
              CAST(DATE_PART('day', _p_fecha_finalizacion_evento::timestamp - _p_fecha_inicio_evento::timestamp) AS INTEGER),
              _p_tipo_evento::"EventType", _p_banner_evento, _p_costo_inscripcion, _p_cod_us, 10.0
          )
          RETURNING cod_evento INTO _nuevo_cod_evento;
          
          -- Registrar al usuario como creador/organizador del evento
          INSERT INTO USUARIO_EVENTO(cod_evento, cod_us)
          VALUES(_nuevo_cod_evento, _p_cod_us);
          
          RETURN _nuevo_cod_evento;
      END;
      $$;
    `;
        console.log('SP reloaded successfully.');
    } catch (error) {
        console.error('Error reloading SP:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
