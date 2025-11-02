-- CreateEnum
CREATE TYPE "ProductQuality" AS ENUM ('usado', 'nuevo');

-- CreateEnum
CREATE TYPE "ProductState" AS ENUM ('disponible', 'agotado');

-- CreateTable
CREATE TABLE "producto" (
    "cod_prod" SERIAL NOT NULL,
    "cod_subcat_prod" INTEGER NOT NULL,
    "nom_prod" VARCHAR(100) NOT NULL,
    "peso_prod" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "calidad_prod" "ProductQuality" NOT NULL,
    "estado_prod" "ProductState" NOT NULL DEFAULT 'disponible',
    "precio_prod" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "marca_prod" VARCHAR(50),
    "desc_prod" VARCHAR(200),

    CONSTRAINT "producto_pkey" PRIMARY KEY ("cod_prod")
);

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_cod_subcat_prod_fkey" FOREIGN KEY ("cod_subcat_prod") REFERENCES "subcategoria_producto"("cod_subcat_prod") ON DELETE CASCADE ON UPDATE CASCADE;
