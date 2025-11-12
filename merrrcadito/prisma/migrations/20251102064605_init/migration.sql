-- CreateTable
CREATE TABLE "ubicacion" (
    "cod_ubi" SERIAL NOT NULL,
    "cod_us" INTEGER NOT NULL,
    "latitud_ubi" DECIMAL(10,6) NOT NULL DEFAULT 0.0,
    "longitud_ubi" DECIMAL(10,6) NOT NULL DEFAULT 0.0,
    "nom_ubi" VARCHAR(100) NOT NULL,

    CONSTRAINT "ubicacion_pkey" PRIMARY KEY ("cod_ubi")
);

-- AddForeignKey
ALTER TABLE "ubicacion" ADD CONSTRAINT "ubicacion_cod_us_fkey" FOREIGN KEY ("cod_us") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
