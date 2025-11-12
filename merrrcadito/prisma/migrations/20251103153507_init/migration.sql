-- CreateTable
CREATE TABLE "calificaciones_publicacion" (
    "cod_pub" INTEGER NOT NULL,
    "cod_us" INTEGER NOT NULL,
    "calif_pub" DECIMAL(3,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "calificaciones_publicacion_pkey" PRIMARY KEY ("cod_pub","cod_us")
);

-- AddForeignKey
ALTER TABLE "calificaciones_publicacion" ADD CONSTRAINT "calificaciones_publicacion_cod_pub_fkey" FOREIGN KEY ("cod_pub") REFERENCES "publicacion"("cod_pub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones_publicacion" ADD CONSTRAINT "calificaciones_publicacion_cod_us_fkey" FOREIGN KEY ("cod_us") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
