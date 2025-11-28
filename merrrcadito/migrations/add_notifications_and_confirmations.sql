-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificacion (
    cod_notif SERIAL PRIMARY KEY,
    cod_us INT NOT NULL REFERENCES usuario(cod_us) ON DELETE CASCADE,
    tipo_notif VARCHAR(50) NOT NULL,
    cod_ref INT,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_notificacion_usuario ON notificacion(cod_us);
CREATE INDEX idx_notificacion_leida ON notificacion(leida);
CREATE INDEX idx_notificacion_fecha ON notificacion(fecha_creacion DESC);

-- Agregar columnas de confirmación a tabla intercambio
ALTER TABLE intercambio 
ADD COLUMN IF NOT EXISTS confirmado_us_1 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmado_us_2 BOOLEAN DEFAULT FALSE;

-- Comentarios para documentación
COMMENT ON TABLE notificacion IS 'Tabla para gestionar notificaciones de usuarios';
COMMENT ON COLUMN notificacion.tipo_notif IS 'Tipos: intercambio_propuesto, intercambio_aceptado, intercambio_rechazado, intercambio_confirmado';
COMMENT ON COLUMN notificacion.cod_ref IS 'Referencia al ID del objeto relacionado (ej: cod_inter)';
COMMENT ON COLUMN intercambio.confirmado_us_1 IS 'Indica si el usuario 1 confirmó el intercambio físico';
COMMENT ON COLUMN intercambio.confirmado_us_2 IS 'Indica si el usuario 2 confirmó el intercambio físico';
