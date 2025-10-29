-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Producto', 'Servicio');

-- CreateTable
CREATE TABLE "categoria" (
    "cod_cat" SERIAL NOT NULL,
    "nom_cat" VARCHAR(100) NOT NULL,
    "descr_cat" VARCHAR(100) NOT NULL,
    "imagen_repr" BYTEA NOT NULL,
    "tipo_cat" "Category" NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("cod_cat")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_nom_cat_key" ON "categoria"("nom_cat");
