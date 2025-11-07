-- CreateTable
CREATE TABLE "intercambio" (
    "cod_inter" SERIAL NOT NULL,
    "cod_us_1" INTEGER NOT NULL,
    "cod_us_2" INTEGER NOT NULL,
    "cant_prod" INTEGER NOT NULL DEFAULT 0,
    "unidad_medida" VARCHAR(20) NOT NULL,
    "foto_inter" BYTEA,
    "impacto_amb_inter" DECIMAL(10,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "intercambio_pkey" PRIMARY KEY ("cod_inter")
);

-- AddForeignKey
ALTER TABLE "intercambio" ADD CONSTRAINT "intercambio_cod_us_1_fkey" FOREIGN KEY ("cod_us_1") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intercambio" ADD CONSTRAINT "intercambio_cod_us_2_fkey" FOREIGN KEY ("cod_us_2") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
