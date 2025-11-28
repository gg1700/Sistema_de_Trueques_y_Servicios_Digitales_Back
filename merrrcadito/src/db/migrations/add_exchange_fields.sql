-- Añadir campos necesarios para el sistema de intercambios

-- 1. Añadir campo de estado al intercambio
ALTER TABLE INTERCAMBIO 
ADD COLUMN IF NOT EXISTS estado_inter VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_inter IN ('pendiente', 'aceptado', 'rechazado'));

-- 2. Añadir campo para diferenciar productos ofrecidos vs solicitados
ALTER TABLE INTERCAMBIO_PRODUCTO
ADD COLUMN IF NOT EXISTS tipo_producto VARCHAR(20) DEFAULT 'ofrecer' CHECK (tipo_producto IN ('ofrecer', 'solicitar'));

-- Comentarios:
-- estado_inter: 'pendiente' cuando se crea, 'aceptado' cuando cod_us_2 aprueba, 'rechazado' cuando cod_us_2 rechaza
-- tipo_producto: 'ofrecer' para productos que cod_us_1 ofrece, 'solicitar' para productos que cod_us_1 quiere de cod_us_2
