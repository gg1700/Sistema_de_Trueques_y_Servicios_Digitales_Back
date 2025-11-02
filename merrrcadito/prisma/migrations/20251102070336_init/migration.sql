-- CreateTable
CREATE TABLE "publicacion" (
    "cod_pub" SERIAL NOT NULL,
    "cod_us" INTEGER NOT NULL,
    "fecha_ini_pub" DATE NOT NULL,
    "fecha_fin_pub" DATE NOT NULL,
    "foto_pub" BYTEA,
    "calif_pond_pub" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "impacto_amb_pub" DECIMAL(10,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "publicacion_pkey" PRIMARY KEY ("cod_pub")
);

-- AddForeignKey
ALTER TABLE "publicacion" ADD CONSTRAINT "publicacion_cod_us_fkey" FOREIGN KEY ("cod_us") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
