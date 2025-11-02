-- CreateTable
CREATE TABLE "calificacion" (
    "cod_calif" SERIAL NOT NULL,
    "calificacion_us" DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    "cod_us_calificador" INTEGER NOT NULL,
    "cod_us_calificado" INTEGER NOT NULL,

    CONSTRAINT "calificacion_pkey" PRIMARY KEY ("cod_calif")
);

-- AddForeignKey
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_cod_us_calificador_fkey" FOREIGN KEY ("cod_us_calificador") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_cod_us_calificado_fkey" FOREIGN KEY ("cod_us_calificado") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
