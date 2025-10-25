
--FUNCION
--CALCULA EL MONTO QUE SE DEBE DESCONTAR DE UNA CUENTA DEPENDIENDO DEL TIPO DE TRANSACCION
CREATE OR REPLACE FUNCTION fn_trans_monto_debito(p_cod_trans INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  v_monto NUMERIC := 0;
  v_cod_pub INTEGER;
  v_cod_potenciador INTEGER;
  v_cod_evento INTEGER;
  v_monto_regalo NUMERIC;
  v_precio_pub NUMERIC;
  v_precio_pot NUMERIC;
  v_costo_insc NUMERIC;
BEGIN
  SELECT cod_pub, cod_potenciador, cod_evento, monto_regalo
    INTO v_cod_pub, v_cod_potenciador, v_cod_evento, v_monto_regalo
  FROM transaccion
  WHERE cod_trans = p_cod_trans;

  IF v_monto_regalo IS NOT NULL AND v_cod_pub IS NULL AND v_cod_potenciador IS NULL AND v_cod_evento IS NULL THEN
    v_monto := v_monto_regalo;
  ELSIF v_cod_pub IS NOT NULL THEN
    SELECT COALESCE(pr.precio_prod, sv.precio_serv) INTO v_precio_pub
    FROM publicacion pu
    LEFT JOIN publicacion_producto pp ON pp.cod_pub = pu.cod_pub
    LEFT JOIN producto pr ON pr.cod_prod = pp.cod_prod
    LEFT JOIN publicacion_servicio ps ON ps.cod_pub = pu.cod_pub
    LEFT JOIN servicio sv ON sv.cod_serv = ps.cod_serv
    WHERE pu.cod_pub = v_cod_pub;
    v_monto := COALESCE(v_precio_pub, 0);
  ELSIF v_cod_potenciador IS NOT NULL THEN
    SELECT precio_potenciador INTO v_precio_pot
    FROM potenciador
    WHERE cod_potenciador = v_cod_potenciador;
    v_monto := COALESCE(v_precio_pot, 0);
  ELSIF v_cod_evento IS NOT NULL THEN
    SELECT costo_inscripcion INTO v_costo_insc
    FROM evento
    WHERE cod_evento = v_cod_evento;
    v_monto := COALESCE(v_costo_insc, 0);
  END IF;

  RETURN v_monto;
END;
$$ LANGUAGE plpgsql;


--TRIGGER
--COMPRUEBA QUE LA TRANSACCION SEA DE UN SOLO TIPO COMO POR EJEMPLO (REGALO, PUBLICACION, POTENCIADOR O EVENTO) Y QUE NO SEA AUTOPAGO
CREATE OR REPLACE FUNCTION trg_before_trans_verificar_modalidad()
RETURNS TRIGGER AS $$
DECLARE
  v_is_gift BOOLEAN;
  v_count INT := 0;
BEGIN
  v_is_gift := (NEW.monto_regalo IS NOT NULL AND NEW.cod_us_destino IS NOT NULL)
               AND NEW.cod_pub IS NULL
               AND NEW.cod_potenciador IS NULL
               AND NEW.cod_evento IS NULL;

  v_count := (CASE WHEN v_is_gift THEN 1 ELSE 0 END)
           + (CASE WHEN NEW.cod_pub IS NOT NULL THEN 1 ELSE 0 END)
           + (CASE WHEN NEW.cod_potenciador IS NOT NULL THEN 1 ELSE 0 END)
           + (CASE WHEN NEW.cod_evento IS NOT NULL THEN 1 ELSE 0 END);

  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Transaccion invalida: seleccione un solo tipo (regalo, publicacion, potenciador o evento).';
  END IF;

  IF NEW.cod_us_destino IS NOT NULL AND NEW.cod_us_destino = NEW.cod_us_origen THEN
    RAISE EXCEPTION 'Transaccion invalida: no se permite enviarse dinero a si mismo.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



--TRIGGER
--CALCULA EL MONTO ANTES DE REGISTRAR LA TRANSACCION , VALIDA QUE EL USUARIO TENGA EL SALDO SUFICIENTE
--EN CASO DE SER UNA TRANSACCION DE REGALO QUE NO ROMPA LAS LIMITACIONES, COMO MAXIMO 2 REGALOS AL MES Y MONTO ENTRE 0 Y 50
CREATE OR REPLACE FUNCTION trg_before_trans_validar_saldo()
RETURNS TRIGGER AS $$
DECLARE
  v_monto NUMERIC := 0;
  v_saldo NUMERIC := 0;
  v_is_gift BOOLEAN := FALSE;
  v_regalos_mes INT := 0;
BEGIN
  v_is_gift := (NEW.monto_regalo IS NOT NULL AND NEW.cod_us_destino IS NOT NULL)
               AND NEW.cod_pub IS NULL
               AND NEW.cod_potenciador IS NULL
               AND NEW.cod_evento IS NULL;

  IF v_is_gift THEN
    IF NEW.monto_regalo <= 0 OR NEW.monto_regalo > 50 THEN
      RAISE EXCEPTION 'Regalo invalido: monto debe ser > 0 y <= 50.';
    END IF;

    SELECT COUNT(*)
      INTO v_regalos_mes
    FROM transaccion t
    WHERE t.cod_us_origen = NEW.cod_us_origen
      AND t.monto_regalo IS NOT NULL
      AND date_trunc('month', t.fecha_trans) = date_trunc('month', CURRENT_DATE);

    IF v_regalos_mes >= 2 THEN
      RAISE EXCEPTION 'Limite mensual de regalos alcanzado.';
    END IF;

    v_monto := NEW.monto_regalo;

  ELSIF NEW.cod_pub IS NOT NULL THEN
    SELECT COALESCE(pr.precio_prod, sv.precio_serv)
      INTO v_monto
    FROM publicacion pu
    LEFT JOIN publicacion_producto pp ON pp.cod_pub = pu.cod_pub
    LEFT JOIN producto pr ON pr.cod_prod = pp.cod_prod
    LEFT JOIN publicacion_servicio ps ON ps.cod_pub = pu.cod_pub
    LEFT JOIN servicio sv ON sv.cod_serv = ps.cod_serv
    WHERE pu.cod_pub = NEW.cod_pub;

  ELSIF NEW.cod_potenciador IS NOT NULL THEN
    SELECT precio_potenciador INTO v_monto
    FROM potenciador
    WHERE cod_potenciador = NEW.cod_potenciador;

  ELSIF NEW.cod_evento IS NOT NULL THEN
    SELECT costo_inscripcion INTO v_monto
    FROM evento
    WHERE cod_evento = NEW.cod_evento;
  END IF;

  IF v_monto IS NULL OR v_monto <= 0 THEN
    RAISE EXCEPTION 'Monto de transaccion no determinado o no valido.';
  END IF;

  SELECT b.saldo_actual
    INTO v_saldo
  FROM billetera b
  WHERE b.cod_us = NEW.cod_us_origen
  FOR UPDATE;

  IF v_saldo IS NULL OR v_saldo < v_monto THEN
    RAISE EXCEPTION 'Saldo insuficiente en billetera.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;




--TRIGGER
--ACTUALIZA LOS SALDOS Y LAS GANANCIAS AL REGISTRAR UNA TRANSACCION
--CALCULA EL MONTO A MOVER DEPENDIENDO DEL TIPO DE TRANSACCION QUE SE REALICE.
--RESTA EL MONTO DEL SALARIO DEL USUARIO QUE PAGA.
--LA SUMA DEL MONTO VARIA, DEPENDIENDO DEL TIPO DE TRANSACCION:
--REGALO:SUMA EL MONTO AL USUARIO DESTINATARIO
--COMPRA DE PUBLICACION: SUMA EL MONTO AL DUEÑO DE LA PUBLICACION
--PAGO DE UN EVENTO: SUMA EL MONTO A LA GANANCIA TOTAL DEL EVENTO
-- POTENCIADORES:NO SE DA A NINGUN OTRO USUSARIO EL PAGO   
CREATE OR REPLACE FUNCTION trg_after_trans_aplicar_saldos()
RETURNS TRIGGER AS $$
DECLARE
  v_monto NUMERIC := 0;
  v_dest_pub INTEGER;
  v_dest_final INTEGER := NULL;
BEGIN
  v_monto := fn_trans_monto_debito(NEW.cod_trans);

  IF NEW.monto_regalo IS NOT NULL AND NEW.cod_us_destino IS NOT NULL
     AND NEW.cod_pub IS NULL AND NEW.cod_potenciador IS NULL AND NEW.cod_evento IS NULL THEN
    v_dest_final := NEW.cod_us_destino;
  ELSIF NEW.cod_pub IS NOT NULL THEN
    SELECT pu.cod_us INTO v_dest_pub
    FROM publicacion pu
    WHERE pu.cod_pub = NEW.cod_pub;
    v_dest_final := v_dest_pub;
  ELSE
    v_dest_final := NULL;
  END IF;

  UPDATE billetera
     SET saldo_actual = saldo_actual - v_monto
   WHERE cod_us = NEW.cod_us_origen;

  IF v_dest_final IS NOT NULL THEN
    UPDATE billetera
       SET saldo_actual = saldo_actual + v_monto
     WHERE cod_us = v_dest_final;
  END IF;

  IF NEW.cod_evento IS NOT NULL THEN
    UPDATE evento
       SET ganancia_evento = COALESCE(ganancia_evento,0) + v_monto
     WHERE cod_evento = NEW.cod_evento;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


--TRIGGER
--REGISTRAR UNA COPIA DE LA TRANSACCION EN BITACORA, PARA TEMAS DE AUDITORIA O CONTROL
CREATE OR REPLACE FUNCTION trg_after_trans_bitacora()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO bitacora(cod_trans) VALUES (NEW.cod_trans);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--TRIGGER
--REGISTRAR UNA COPIA DEL ACCESO EN BITACORA, PARA TEMAS DE AUDITORIA O CONTROL
CREATE OR REPLACE FUNCTION trg_after_acceso_bitacora()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO bitacora(cod_acc) VALUES (NEW.cod_acc);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



--TRIGGER
--REGISTRAR UNA COPIA DEL CAMBIO DE CONTRASEÑA EN BITACORA, PARA TEMAS DE AUDITORIA O CONTROL
CREATE OR REPLACE FUNCTION trg_after_contrasenia_bitacora()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO bitacora(cod_camb) VALUES (NEW.cod_camb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


--TRIGGER
--RECALCULA EL PROMEDIO DE CALIFICACION PONDERADA DE UNA PUBLICACION CUANDO SE AGREGA UNA NUEVA CALIFICACION
CREATE OR REPLACE FUNCTION trg_after_calif_pub_recalc()
RETURNS TRIGGER AS $$
DECLARE
  v_avg NUMERIC;
BEGIN
  SELECT AVG(c.calif_pub)::NUMERIC
    INTO v_avg
  FROM calificaciones_publicacion c
  WHERE c.cod_pub = NEW.cod_pub;

  UPDATE publicacion
     SET calif_pond_pub = COALESCE(v_avg, 0)
   WHERE cod_pub = NEW.cod_pub;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


--TRIGGER
--ACTUALIZA EL ESTADO DEL LOGRO SEGUN EL PROGRESO, SI LLEGA A 100 CAMBIA A COMPLETADO Y SETEA LA FECHA DE OBTENCION
CREATE OR REPLACE FUNCTION trg_after_usr_logro_estado()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.progreso >= 100 THEN
    UPDATE usuario_logro
       SET estado_logro = 'Completado',
           fechaObtencio_logro = NOW()
     WHERE cod_us = NEW.cod_us AND cod_logro = NEW.cod_logro;
  ELSE
    UPDATE usuario_logro
       SET estado_logro = COALESCE(NEW.estado_logro, 'En progreso')
     WHERE cod_us = NEW.cod_us AND cod_logro = NEW.cod_logro;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



--TRIGGER
--SUMA 1 AL CONTADOR DE INSCRITOS DEL EVENTO CUANDO ALGUIEN SE INSCRIBE
CREATE OR REPLACE FUNCTION trg_after_usr_evento_inc()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE evento
     SET cant_personas_inscritas = COALESCE(cant_personas_inscritas,0) + 1
   WHERE cod_evento = NEW.cod_evento;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


--TRIGGER
--RESTA 1 AL CONTADOR DE INSCRITOS DEL EVENTO CUANDO ALGUIEN SE DESINSCRIBE
CREATE OR REPLACE FUNCTION trg_after_usr_evento_dec()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE evento
     SET cant_personas_inscritas = GREATEST(COALESCE(cant_personas_inscritas,0) - 1, 0)
   WHERE cod_evento = OLD.cod_evento;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;



--TRIGGER
--CALCULA LA DURACION Y EL ESTADO DEL EVENTO ANTES DE INSERTARLO
CREATE OR REPLACE FUNCTION trg_before_evento_set_duracion_estado()
RETURNS TRIGGER AS $$
DECLARE
  v_dias INT;
BEGIN
  IF NEW.fecha_finalizacion_evento < NEW.fecha_inicio_evento THEN
    RAISE EXCEPTION 'Las fechas del evento son invalidas.';
  END IF;

  v_dias := CEIL(EXTRACT(EPOCH FROM (NEW.fecha_finalizacion_evento::timestamp - NEW.fecha_inicio_evento::timestamp)) / 86400.0);
  NEW.duracion_evento := v_dias;

  IF NOW()::date <= NEW.fecha_finalizacion_evento AND NOW()::date >= NEW.fecha_inicio_evento THEN
    NEW.estado_evento := 'vigente';
  ELSIF NOW()::date > NEW.fecha_finalizacion_evento THEN
    NEW.estado_evento := 'finalizado';
  ELSE
    NEW.estado_evento := 'vigente';
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


--TRIGGER
--RECALCULA LA DURACION Y EL ESTADO DEL EVENTO CUANDO SE MODIFICAN LAS FECHAS
CREATE OR REPLACE FUNCTION trg_after_evento_recalc_duracion_estado()
RETURNS TRIGGER AS $$
DECLARE
  v_dias INT;
BEGIN
  IF NEW.fecha_inicio_evento IS DISTINCT FROM OLD.fecha_inicio_evento
     OR NEW.fecha_finalizacion_evento IS DISTINCT FROM OLD.fecha_finalizacion_evento THEN

    IF NEW.fecha_finalizacion_evento < NEW.fecha_inicio_evento THEN
      RAISE EXCEPTION 'Las fechas del evento son invalidas.';
    END IF;

    v_dias := CEIL(EXTRACT(EPOCH FROM (NEW.fecha_finalizacion_evento::timestamp - NEW.fecha_inicio_evento::timestamp)) / 86400.0);
    NEW.duracion_evento := v_dias;

    IF NOW()::date <= NEW.fecha_finalizacion_evento AND NOW()::date >= NEW.fecha_inicio_evento THEN
      NEW.estado_evento := 'vigente';
    ELSIF NOW()::date > NEW.fecha_finalizacion_evento THEN
      NEW.estado_evento := 'finalizado';
    ELSE
      NEW.estado_evento := 'vigente';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--TRIGGER
--NORMALIZA LA INSERCION DE SUBCATEGORIA(NUMERACION/NORMALIZACION)
CREATE OR REPLACE FUNCTION trg_before_subcat_normalizar()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--TRIGGER
--CUENTA LAS ADVERTENCIAS DE UN USUARIO Y LO SUSPENDE SI SUPERA EL LIMITE DE 3
CREATE OR REPLACE FUNCTION trg_after_registro_advertencia_estado()
RETURNS TRIGGER AS $$
DECLARE
  v_cant INT := 0;
  v_cod_us INTEGER;
BEGIN
  SELECT ua.cod_us INTO v_cod_us
  FROM usuario_advertencia ua
  WHERE ua.cod_adv = NEW.cod_adv AND ua.cod_us = NEW.cod_us;

  SELECT COUNT(*) INTO v_cant
  FROM usuario_advertencia
  WHERE cod_us = v_cod_us;

  IF v_cant > 3 THEN
    UPDATE usuario SET estado_us = 'suspendido' WHERE cod_us = v_cod_us;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--EJECUCION DEL TRIGGER
--VERIFICAR MODALIDAD DE LA TRANSACCION ANTES DE INSERTARLA
CREATE TRIGGER before_insert_transaccion_verificar_modalidad
BEFORE INSERT ON transaccion
FOR EACH ROW
EXECUTE FUNCTION trg_before_trans_verificar_modalidad();

--EJECUCION DEL TRIGGER
--CALCULA EL MONTO Y VALIDAR SALDO ANTES DE INSERTAR LA TRANSACCION
CREATE TRIGGER before_insert_transaccion_validar_saldo
BEFORE INSERT ON transaccion
FOR EACH ROW
EXECUTE FUNCTION trg_before_trans_validar_saldo();

--EJECUCION DEL TRIGGER
--APLICA ACREDITACIONES Y DEBITOS DESPUES DE INSERTAR LA TRANSACCION
CREATE TRIGGER after_insert_transaccion_aplicar_saldos
AFTER INSERT ON transaccion
FOR EACH ROW
EXECUTE FUNCTION trg_after_trans_aplicar_saldos();

--EJECUCION DEL TRIGGER
--REGISTRAR LA TRANSACCION EN LA BITACORA
CREATE TRIGGER after_insert_transaccion_registrar_bitacora
AFTER INSERT ON transaccion
FOR EACH ROW
EXECUTE FUNCTION trg_after_trans_bitacora();

--EJECUCION DEL TRIGGER
--REGISTRAR EL ACCESO EN LA BITACORA
CREATE TRIGGER after_insert_acceso_bitacora
AFTER INSERT ON acceso
FOR EACH ROW
EXECUTE FUNCTION trg_after_acceso_bitacora();

--EJECUCION DEL TRIGGER
--REGISTRAR EL CAMBIO DE CONTRASEÑA EN LA BITACORA
CREATE TRIGGER after_insert_contrasenia_registrar_bitacora
AFTER INSERT ON contrasenia
FOR EACH ROW
EXECUTE FUNCTION trg_after_contrasenia_bitacora();

--EJECUCION DEL TRIGGER
--RECALCULA LA CALIFICACION PONDERADA DE LA PUBLICACION DESPUES DE INSERTAR UNA NUEVA CALIFICACION
CREATE TRIGGER after_insert_calcular_calificacion_ponderada
AFTER INSERT ON calificaciones_publicacion
FOR EACH ROW
EXECUTE FUNCTION trg_after_calif_pub_recalc();

--EJECUCION DEL TRIGGER
--ACTUALIZA EL ESTADO DEL LOGRO SEGUN EL PROGRESO
CREATE TRIGGER after_update_progreso_logro
AFTER INSERT OR UPDATE ON usuario_logro
FOR EACH ROW
EXECUTE FUNCTION trg_after_usr_logro_estado();

--EJECUCION DEL TRIGGER
--SUMAR INSCRITO AL EVENTO
CREATE TRIGGER after_insert_usuario_evento_incrementar_contador
AFTER INSERT ON usuario_evento
FOR EACH ROW
EXECUTE FUNCTION trg_after_usr_evento_inc();

--EJECUCION DEL TRIGGER
--REGISTRAR LA BAJA DE INSCRITO AL EVENTO
CREATE TRIGGER after_delete_usuario_evento_decrementar_contador
AFTER DELETE ON usuario_evento
FOR EACH ROW
EXECUTE FUNCTION trg_after_usr_evento_dec();

--EJECUCION DEL TRIGGER
--CALCULA DURACION Y ESTADO DEL EVENTO ANTES DE INSERTARLO
CREATE TRIGGER before_insert_evento_autocalcular_duracion_y_estado
BEFORE INSERT ON evento
FOR EACH ROW
EXECUTE FUNCTION trg_before_evento_set_duracion_estado();

--EJECUCION DEL TRIGGER
--RECALCULA DURACION Y ESTADO DEL EVENTO DESPUES DE ACTUALIZARLO
CREATE TRIGGER after_update_evento_recalcular_duracion_y_estado
AFTER UPDATE ON evento
FOR EACH ROW
EXECUTE FUNCTION trg_after_evento_recalc_duracion_estado();

--EJECUCION DEL TRIGGER
--PREPARA LA INSERCION DE LA SUBCATEGORIA NORMALIZANDOLA
CREATE TRIGGER before_insert_subcategoria
BEFORE INSERT ON subcategoria_producto
FOR EACH ROW
EXECUTE FUNCTION trg_before_subcat_normalizar();

--EJECUCION DEL TRIGGER
--CONTAR ADVERTENCIAS Y SUSPENDER USUARIO SI CORRESPONDE
CREATE TRIGGER after_insert_registroAdvertencia
AFTER INSERT ON usuario_advertencia
FOR EACH ROW
EXECUTE FUNCTION trg_after_registro_advertencia_estado();
