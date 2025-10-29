-- CreateTable
CREATE TABLE "material" (
    "cod_mat" SERIAL NOT NULL,
    "nom_mat" VARCHAR(100) NOT NULL,
    "descr_mat" VARCHAR(200),
    "factor_co2" DECIMAL(10,4) NOT NULL,
    "unidad_medida_co2" VARCHAR(20) NOT NULL DEFAULT 'kg',

    CONSTRAINT "material_pkey" PRIMARY KEY ("cod_mat")
);

-- CreateTable
CREATE TABLE "equivalencia_co2" (
    "cod_equiv" SERIAL NOT NULL,
    "cod_mat" INTEGER NOT NULL,
    "unidad_origen" VARCHAR(20) NOT NULL,
    "unidad_destino" VARCHAR(20) NOT NULL DEFAULT 'kg_co2',
    "factor_conversion" DECIMAL(12,6) NOT NULL,
    "descripcion_equiv" VARCHAR(200),
    "fecha_actualizacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fuente_datos" VARCHAR(200),

    CONSTRAINT "equivalencia_co2_pkey" PRIMARY KEY ("cod_equiv")
);

-- CreateIndex
CREATE UNIQUE INDEX "material_nom_mat_key" ON "material"("nom_mat");

-- CreateIndex
CREATE UNIQUE INDEX "equivalencia_co2_cod_mat_unidad_origen_unidad_destino_key" ON "equivalencia_co2"("cod_mat", "unidad_origen", "unidad_destino");

-- AddForeignKey
ALTER TABLE "equivalencia_co2" ADD CONSTRAINT "equivalencia_co2_cod_mat_fkey" FOREIGN KEY ("cod_mat") REFERENCES "material"("cod_mat") ON DELETE CASCADE ON UPDATE CASCADE;
