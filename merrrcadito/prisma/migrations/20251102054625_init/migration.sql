-- CreateTable
CREATE TABLE "material_producto" (
    "cod_mat" INTEGER NOT NULL,
    "cod_prod" INTEGER NOT NULL,

    CONSTRAINT "material_producto_pkey" PRIMARY KEY ("cod_mat","cod_prod")
);

-- AddForeignKey
ALTER TABLE "material_producto" ADD CONSTRAINT "material_producto_cod_mat_fkey" FOREIGN KEY ("cod_mat") REFERENCES "material"("cod_mat") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_producto" ADD CONSTRAINT "material_producto_cod_prod_fkey" FOREIGN KEY ("cod_prod") REFERENCES "producto"("cod_prod") ON DELETE CASCADE ON UPDATE CASCADE;
