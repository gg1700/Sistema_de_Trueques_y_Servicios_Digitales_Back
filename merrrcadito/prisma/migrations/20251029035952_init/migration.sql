-- CreateTable
CREATE TABLE "subcategoria" (
    "cod_subcat_prod" SERIAL NOT NULL,
    "cod_cat" INTEGER NOT NULL,
    "nom_subcat_prod" VARCHAR(100) NOT NULL,
    "descr_subcat_prod" VARCHAR(200) NOT NULL,
    "imagen_representativa" BYTEA NOT NULL,

    CONSTRAINT "subcategoria_pkey" PRIMARY KEY ("cod_subcat_prod")
);

-- CreateIndex
CREATE UNIQUE INDEX "subcategoria_nom_subcat_prod_key" ON "subcategoria"("nom_subcat_prod");

-- AddForeignKey
ALTER TABLE "subcategoria" ADD CONSTRAINT "subcategoria_cod_cat_fkey" FOREIGN KEY ("cod_cat") REFERENCES "categoria"("cod_cat") ON DELETE CASCADE ON UPDATE CASCADE;
