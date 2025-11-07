-- CreateTable
CREATE TABLE "publicacion_producto" (
    "cod_pub" INTEGER NOT NULL,
    "cod_prod" INTEGER NOT NULL,
    "cant_prod" INTEGER NOT NULL DEFAULT 0,
    "unidad_medida" VARCHAR(20) NOT NULL,

    CONSTRAINT "publicacion_producto_pkey" PRIMARY KEY ("cod_pub","cant_prod")
);

-- AddForeignKey
ALTER TABLE "publicacion_producto" ADD CONSTRAINT "publicacion_producto_cod_pub_fkey" FOREIGN KEY ("cod_pub") REFERENCES "publicacion"("cod_pub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacion_producto" ADD CONSTRAINT "publicacion_producto_cod_prod_fkey" FOREIGN KEY ("cod_prod") REFERENCES "producto"("cod_prod") ON DELETE CASCADE ON UPDATE CASCADE;
