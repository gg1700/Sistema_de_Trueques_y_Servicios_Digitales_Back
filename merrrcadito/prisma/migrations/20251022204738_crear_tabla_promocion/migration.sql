-- CreateTable
CREATE TABLE "Promocion" (
    "cod_prom" SERIAL NOT NULL,
    "titulo_prom" VARCHAR(100) NOT NULL,
    "fecha_ini_prom" TIMESTAMP(6) NOT NULL,
    "duracion_prom" INTEGER NOT NULL,
    "fecha_fin_prom" TIMESTAMP(6) NOT NULL,
    "descr_prom" VARCHAR(300) NOT NULL,
    "banner_prom" BYTEA,
    "descuento_prom" DECIMAL(5,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "Promocion_pkey" PRIMARY KEY ("cod_prom")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promocion_titulo_prom_key" ON "Promocion"("titulo_prom");
