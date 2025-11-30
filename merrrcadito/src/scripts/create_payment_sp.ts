import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Creating sp_inscribirEventoConPago...');
        await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION sp_inscribirEventoConPago(
          _p_cod_us INT,
          _p_cod_evento INT
      ) RETURNS TABLE (
          success BOOLEAN,
          message VARCHAR
      ) LANGUAGE plpgsql AS $$
      DECLARE
          _costo DECIMAL(12,2);
          _cod_creador INT;
          _cod_org INT;
          _saldo_usuario DECIMAL(12,2);
          _titulo_evento VARCHAR(100);
      BEGIN
          -- Obtener datos del evento
          SELECT costo_inscripcion, cod_us_creador, cod_org, titulo_evento
          INTO _costo, _cod_creador, _cod_org, _titulo_evento
          FROM EVENTO
          WHERE cod_evento = _p_cod_evento;

          IF NOT FOUND THEN
              RETURN QUERY SELECT FALSE, 'Evento no encontrado'::VARCHAR;
              RETURN;
          END IF;

          -- Verificar si ya está inscrito
          IF EXISTS (SELECT 1 FROM USUARIO_EVENTO WHERE cod_evento = _p_cod_evento AND cod_us = _p_cod_us) THEN
              RETURN QUERY SELECT FALSE, 'Usuario ya inscrito'::VARCHAR;
              RETURN;
          END IF;

          -- Si tiene costo, procesar pago
          IF _costo > 0 THEN
              -- Verificar saldo
              SELECT saldo_actual INTO _saldo_usuario
              FROM BILLETERA
              WHERE cod_us = _p_cod_us;

              IF _saldo_usuario IS NULL OR _saldo_usuario < _costo THEN
                  RETURN QUERY SELECT FALSE, 'Saldo insuficiente'::VARCHAR;
                  RETURN;
              END IF;

              -- Insertar transacción con valores NULL explícitos para campos no usados
              -- Los triggers se encargarán de validar y aplicar saldos
              INSERT INTO TRANSACCION(
                  cod_us_origen, 
                  cod_us_destino, 
                  cod_pub,
                  cod_evento, 
                  cod_potenciador,
                  desc_trans, 
                  fecha_trans, 
                  moneda, 
                  monto_regalo,
                  estado_trans
              ) VALUES (
                  _p_cod_us, 
                  _cod_creador, 
                  NULL,
                  _p_cod_evento,
                  NULL,
                  'Inscripción a evento: ' || _titulo_evento, 
                  NOW(), 
                  'CV',
                  NULL,
                  'satisfactorio'
              );
          END IF;

          -- Inscribir usuario
          INSERT INTO USUARIO_EVENTO(cod_evento, cod_us)
          VALUES(_p_cod_evento, _p_cod_us);

          -- Actualizar contador de inscritos
          UPDATE EVENTO SET cant_personas_inscritas = cant_personas_inscritas + 1
          WHERE cod_evento = _p_cod_evento;

          RETURN QUERY SELECT TRUE, 'Inscripción exitosa'::VARCHAR;
      EXCEPTION 
          WHEN OTHERS THEN
              RETURN QUERY SELECT FALSE, ('Error: ' || SQLERRM)::VARCHAR;
      END;
      $$;
    `;
        console.log('SP created successfully.');
    } catch (error) {
        console.error('Error creating SP:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
