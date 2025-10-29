/*
  Warnings:

  - You are about to drop the `subcategoria` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."subcategoria" DROP CONSTRAINT "subcategoria_cod_cat_fkey";

-- DropTable
DROP TABLE "public"."subcategoria";

-- CreateTable
CREATE TABLE "subcategoria_producto" (
    "cod_subcat_prod" SERIAL NOT NULL,
    "cod_cat" INTEGER NOT NULL,
    "nom_subcat_prod" VARCHAR(100) NOT NULL,
    "descr_subcat_prod" VARCHAR(200) NOT NULL,
    "imagen_representativa" BYTEA NOT NULL,

    CONSTRAINT "subcategoria_producto_pkey" PRIMARY KEY ("cod_subcat_prod")
);

-- CreateIndex
CREATE UNIQUE INDEX "subcategoria_producto_nom_subcat_prod_key" ON "subcategoria_producto"("nom_subcat_prod");

-- AddForeignKey
ALTER TABLE "subcategoria_producto" ADD CONSTRAINT "subcategoria_producto_cod_cat_fkey" FOREIGN KEY ("cod_cat") REFERENCES "categoria"("cod_cat") ON DELETE CASCADE ON UPDATE CASCADE;
