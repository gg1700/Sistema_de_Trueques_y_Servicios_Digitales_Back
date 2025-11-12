-- CreateTable
CREATE TABLE "publicacion_promocion" (
    "cod_pub" INTEGER NOT NULL,
    "cod_prom" INTEGER NOT NULL,

    CONSTRAINT "publicacion_promocion_pkey" PRIMARY KEY ("cod_pub","cod_prom")
);

-- AddForeignKey
ALTER TABLE "publicacion_promocion" ADD CONSTRAINT "publicacion_promocion_cod_pub_fkey" FOREIGN KEY ("cod_pub") REFERENCES "publicacion"("cod_pub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacion_promocion" ADD CONSTRAINT "publicacion_promocion_cod_prom_fkey" FOREIGN KEY ("cod_prom") REFERENCES "promocion"("cod_prom") ON DELETE CASCADE ON UPDATE CASCADE;
