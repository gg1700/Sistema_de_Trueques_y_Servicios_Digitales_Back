-- CreateTable
CREATE TABLE "detalle_usuario" (
    "cod_us" INTEGER NOT NULL,
    "cant_adv" INTEGER NOT NULL DEFAULT 0,
    "fecha_registro" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cant_hrs_libres" INTEGER NOT NULL DEFAULT 0,
    "cant_dias_libres" INTEGER NOT NULL DEFAULT 0,
    "dias_ocupados" INTEGER NOT NULL DEFAULT 0,
    "hrs_ocupadas" INTEGER NOT NULL DEFAULT 0,
    "calif_pond_us" DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    "cant_ventas" INTEGER NOT NULL DEFAULT 0,
    "huella_co2" DECIMAL(10,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "detalle_usuario_pkey" PRIMARY KEY ("cod_us")
);

-- CreateIndex
CREATE UNIQUE INDEX "detalle_usuario_cod_us_key" ON "detalle_usuario"("cod_us");

-- AddForeignKey
ALTER TABLE "detalle_usuario" ADD CONSTRAINT "detalle_usuario_cod_us_fkey" FOREIGN KEY ("cod_us") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
