-- CreateTable
CREATE TABLE "intercambio_producto" (
    "cod_inter" INTEGER NOT NULL,
    "cod_prod" INTEGER NOT NULL,

    CONSTRAINT "intercambio_producto_pkey" PRIMARY KEY ("cod_inter","cod_prod")
);

-- AddForeignKey
ALTER TABLE "intercambio_producto" ADD CONSTRAINT "intercambio_producto_cod_inter_fkey" FOREIGN KEY ("cod_inter") REFERENCES "intercambio"("cod_inter") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intercambio_producto" ADD CONSTRAINT "intercambio_producto_cod_prod_fkey" FOREIGN KEY ("cod_prod") REFERENCES "producto"("cod_prod") ON DELETE CASCADE ON UPDATE CASCADE;
