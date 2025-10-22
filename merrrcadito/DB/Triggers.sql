CREATE OR REPLACE FUNCTION fn_after_insert_usuario_evento_incrementar()
RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
  UPDATE evento
     SET cant_personas_inscritas = cant_personas_inscritas + 1
   WHERE cod_evento = NEW.cod_evento;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_insert_usuario_evento_incrementar_contador ON usuario_evento;
CREATE TRIGGER after_insert_usuario_evento_incrementar_contador
AFTER INSERT ON usuario_evento
FOR EACH ROW
EXECUTE FUNCTION fn_after_insert_usuario_evento_incrementar();


CREATE OR REPLACE FUNCTION fn_after_delete_usuario_evento_decrementar()
RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
  UPDATE evento
     SET cant_personas_inscritas = GREATEST(cant_personas_inscritas - 1, 0)
   WHERE cod_evento = OLD.cod_evento;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_delete_usuario_evento_decrementar_contador ON usuario_evento;
CREATE TRIGGER after_delete_usuario_evento_decrementar_contador
AFTER DELETE ON usuario_evento
FOR EACH ROW
EXECUTE FUNCTION fn_after_delete_usuario_evento_decrementar();


CREATE OR REPLACE FUNCTION fn_before_insert_subcategoria_reenumerar_si_primera()
RETURNS trigger
LANGUAGE plpgsql AS
$$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM subcategoria_producto
  WHERE cod_cat = NEW.cod_cat;

  IF v_count = 0 THEN
    NEW.cod_subcat_prod := NEW.cod_cat * 1000 + 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_insert_subcategoria ON subcategoria_producto;
CREATE TRIGGER before_insert_subcategoria
BEFORE INSERT ON subcategoria_producto
FOR EACH ROW
EXECUTE FUNCTION fn_before_insert_subcategoria_reenumerar_si_primera();


CREATE OR REPLACE FUNCTION fn_after_insert_usuario_advertencia_control()
RETURNS trigger
LANGUAGE plpgsql AS
$$
DECLARE
  v_total int;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM usuario_advertencia
  WHERE id_us = NEW.id_us;

  UPDATE detalle_usuario
     SET cant_adv = v_total
   WHERE id_us = NEW.id_us;

  IF v_total > 3 THEN
    UPDATE usuario
       SET estado_us = 'suspendido'
     WHERE id_us = NEW.id_us;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_insert_registroAdvertencia ON usuario_advertencia;
CREATE TRIGGER after_insert_registroAdvertencia
AFTER INSERT ON usuario_advertencia
FOR EACH ROW
EXECUTE FUNCTION fn_after_insert_usuario_advertencia_control();


CREATE OR REPLACE FUNCTION fn_before_insert_promocion_validar_fechas()
RETURNS trigger
LANGUAGE plpgsql AS
$$
DECLARE
  v_dias int;
BEGIN
  IF NEW.fecha_fin_prom <= NEW.fecha_ini_prom THEN
    RAISE EXCEPTION
      'La fecha de fin (%) debe ser mayor a la fecha de inicio (%)',
      NEW.fecha_fin_prom, NEW.fecha_ini_prom;
  END IF;

  v_dias := (NEW.fecha_fin_prom::date - NEW.fecha_ini_prom::date);
  IF v_dias > 45 THEN
    RAISE EXCEPTION
      'La duración de la promoción (% días) excede el máximo permitido (45).',
      v_dias;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_insert_promocion ON promocion;
CREATE TRIGGER before_insert_promocion
BEFORE INSERT ON promocion
FOR EACH ROW
EXECUTE FUNCTION fn_before_insert_promocion_validar_fechas();


CREATE OR REPLACE FUNCTION fn_after_insert_acceso_bitacora()
RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
  INSERT INTO bitacora (cod_acc, cod_trans, cod_camb)
  VALUES (NEW.cod_acc, NULL, NULL);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_insert_acceso_bitacora ON acceso;
CREATE TRIGGER after_insert_acceso_bitacora
AFTER INSERT ON acceso
FOR EACH ROW
EXECUTE FUNCTION fn_after_insert_acceso_bitacora();


CREATE OR REPLACE FUNCTION fn_before_insert_evento_autocalc()
RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
  IF NEW.fecha_finalizacion_evento < NEW.fecha_inicio_evento THEN
    RAISE EXCEPTION 'La fecha de fin (%) no puede ser menor a la fecha de inicio (%)',
      NEW.fecha_finalizacion_evento, NEW.fecha_inicio_evento;
  END IF;

  NEW.duracion_evento := (NEW.fecha_finalizacion_evento - NEW.fecha_inicio_evento);

  IF CURRENT_DATE > NEW.fecha_finalizacion_evento THEN
    NEW.estado_evento := 'finalizado';
  ELSIF CURRENT_DATE >= NEW.fecha_inicio_evento AND CURRENT_DATE <= NEW.fecha_finalizacion_evento THEN
    NEW.estado_evento := 'vigente';
  ELSE
    NEW.estado_evento := COALESCE(NEW.estado_evento, 'vigente');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_insert_evento_autocalcular_duracion_y_estado ON evento;
CREATE TRIGGER before_insert_evento_autocalcular_duracion_y_estado
BEFORE INSERT ON evento
FOR EACH ROW
EXECUTE FUNCTION fn_before_insert_evento_autocalc();


CREATE OR REPLACE FUNCTION fn_after_update_evento_recalc()
RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
  UPDATE evento
     SET duracion_evento = (fecha_finalizacion_evento - fecha_inicio_evento),
         estado_evento =
           CASE
             WHEN CURRENT_DATE > fecha_finalizacion_evento THEN 'finalizado'
             WHEN CURRENT_DATE >= fecha_inicio_evento AND CURRENT_DATE <= fecha_finalizacion_evento THEN 'vigente'
             ELSE estado_evento
           END
   WHERE cod_evento = NEW.cod_evento;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_update_evento_recalcular_duracion_y_estado ON evento;
CREATE TRIGGER after_update_evento_recalcular_duracion_y_estado
AFTER UPDATE ON evento
FOR EACH ROW
EXECUTE FUNCTION fn_after_update_evento_recalc();


CREATE OR REPLACE FUNCTION fn_before_insert_transaccion_no_autopago()
RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
  IF NEW.id_us_origen = NEW.id_us_destino THEN
    RAISE EXCEPTION 'No se permite autopago (origen = destino: %).', NEW.id_us_origen;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_insert_transaccion_prevenir_autopago ON transaccion;
CREATE TRIGGER before_insert_transaccion_prevenir_autopago
BEFORE INSERT ON transaccion
FOR EACH ROW
EXECUTE FUNCTION fn_before_insert_transaccion_no_autopago();


CREATE OR REPLACE FUNCTION fn_after_insert_transaccion_bitacora()
RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
  INSERT INTO bitacora (cod_acc, cod_trans, cod_camb)
  VALUES (NULL, NEW.cod_trans, NULL);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_insert_transaccion_registrar_bitacora ON transaccion;
CREATE TRIGGER after_insert_transaccion_registrar_bitacora
AFTER INSERT ON transaccion
FOR EACH ROW
EXECUTE FUNCTION fn_after_insert_transaccion_bitacora();


CREATE OR REPLACE FUNCTION fn_contrasenia_bitacora_update()
RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
  INSERT INTO bitacora (cod_acc, cod_trans, cod_camb)
  VALUES (NULL, NULL, NEW.cod_camb);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_update_contrasenia_registrar_bitacora ON contrasenia;
CREATE TRIGGER after_update_contrasenia_registrar_bitacora
AFTER UPDATE ON contrasenia
FOR EACH ROW
EXECUTE FUNCTION fn_contrasenia_bitacora_update();


CREATE OR REPLACE FUNCTION fn_before_insert_publicacion_validar_fechas()
RETURNS trigger
LANGUAGE plpgsql AS
$$
DECLARE
  v_dias int;
BEGIN
  IF NEW.fecha_fin_pub < NEW.fecha_ini_pub THEN
    RAISE EXCEPTION 'La fecha de fin (%) no puede ser menor que la de inicio (%).',
      NEW.fecha_fin_pub, NEW.fecha_ini_pub;
  END IF;

  v_dias := (NEW.fecha_fin_pub - NEW.fecha_ini_pub);
  IF v_dias > 60 THEN
    RAISE EXCEPTION 'La duración de la publicación (% días) excede el máximo permitido (60).', v_dias;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_insert_publicacion_validar_fechas ON publicacion;
CREATE TRIGGER before_insert_publicacion_validar_fechas
BEFORE INSERT ON publicacion
FOR EACH ROW
EXECUTE FUNCTION fn_before_insert_publicacion_validar_fechas();


CREATE OR REPLACE FUNCTION fn_after_insert_calif_recalcular_pub()
RETURNS trigger
LANGUAGE plpgsql AS
$$
DECLARE
  v_prom numeric(5,3);
BEGIN
  SELECT AVG(cp.calif_pub)::numeric(5,3)
    INTO v_prom
  FROM calificaciones_publicacion cp
  WHERE cp.cod_pub = NEW.cod_pub;

  UPDATE publicacion
     SET calif_pond_pub = COALESCE(v_prom, 0)::numeric(3,2)
   WHERE cod_pub = NEW.cod_pub;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_insert_calcular_calificacion_ponderada ON calificaciones_publicacion;
CREATE TRIGGER after_insert_calcular_calificacion_ponderada
AFTER INSERT ON calificaciones_publicacion
FOR EACH ROW
EXECUTE FUNCTION fn_after_insert_calif_recalcular_pub();


CREATE OR REPLACE FUNCTION fn_after_insert_transaccion_aplicar_saldos()
RETURNS trigger
LANGUAGE plpgsql AS
$$
DECLARE
  v_saldo_origen numeric(12,2);
BEGIN
  IF NEW.estado_trans <> 'satisfactorio' THEN
    RETURN NULL;
  END IF;

  SELECT saldo_actual INTO v_saldo_origen
  FROM billetera
  WHERE id_us = NEW.id_us_origen
  FOR UPDATE;

  IF v_saldo_origen IS NULL THEN
    RAISE EXCEPTION 'El usuario origen % no tiene billetera.', NEW.id_us_origen;
  END IF;

  IF v_saldo_origen < NEW.monto_regalo THEN
    RAISE EXCEPTION 'Fondos insuficientes en origen (saldo=%, requerido=%).',
      v_saldo_origen, NEW.monto_regalo;
  END IF;

  UPDATE billetera
     SET saldo_actual = saldo_actual - NEW.monto_regalo
   WHERE id_us = NEW.id_us_origen;

  UPDATE billetera
     SET saldo_actual = saldo_actual + NEW.monto_regalo
   WHERE id_us = NEW.id_us_destino;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_insert_transaccion_aplicar_saldos_billetera ON transaccion;
CREATE TRIGGER after_insert_transaccion_aplicar_saldos_billetera
AFTER INSERT ON transaccion
FOR EACH ROW
EXECUTE FUNCTION fn_after_insert_transaccion_aplicar_saldos();


CREATE OR REPLACE FUNCTION fn_after_insert_usuario_logro_completar_si_100()
RETURNS trigger
LANGUAGE plpgsql AS
$$
BEGIN
  IF NEW.progreso >= 100.0 THEN
    UPDATE usuario_logro
       SET fechaObtencion_logro = COALESCE(NEW.fechaObtencion_logro, NOW()),
           estado_logro        = COALESCE(NEW.estado_logro, 'Completado')
     WHERE id_us = NEW.id_us
       AND cod_logro = NEW.cod_logro;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS after_insert_progreso_logro ON usuario_logro;
CREATE TRIGGER after_insert_progreso_logro
AFTER INSERT ON usuario_logro
FOR EACH ROW
EXECUTE FUNCTION fn_after_insert_usuario_logro_completar_si_100();