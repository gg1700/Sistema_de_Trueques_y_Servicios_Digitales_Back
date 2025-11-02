-- CreateTable
CREATE TABLE "promocion_producto" (
    "cod_subcat_prod" INTEGER NOT NULL,
    "cod_prom" INTEGER NOT NULL,

    CONSTRAINT "promocion_producto_pkey" PRIMARY KEY ("cod_subcat_prod","cod_prom")
);

-- AddForeignKey
ALTER TABLE "promocion_producto" ADD CONSTRAINT "promocion_producto_cod_subcat_prod_fkey" FOREIGN KEY ("cod_subcat_prod") REFERENCES "subcategoria_producto"("cod_subcat_prod") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocion_producto" ADD CONSTRAINT "promocion_producto_cod_prom_fkey" FOREIGN KEY ("cod_prom") REFERENCES "promocion"("cod_prom") ON DELETE CASCADE ON UPDATE CASCADE;
