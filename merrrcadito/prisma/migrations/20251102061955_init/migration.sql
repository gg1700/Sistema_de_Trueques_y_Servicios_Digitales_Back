-- CreateEnum
CREATE TYPE "BoosterLevel" AS ENUM ('debil', 'medio', 'fuerte');

-- CreateTable
CREATE TABLE "potenciador" (
    "cod_potenciador" SERIAL NOT NULL,
    "nombre_potenciador" VARCHAR(100) NOT NULL,
    "precio_potenciador" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "descripcion_potenciador" VARCHAR(200),
    "multiplicador_potenciador" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "fecha_inicio_potenciador" TIMESTAMP(6) NOT NULL,
    "fecha_finalizacion_potenciador" TIMESTAMP(6) NOT NULL,
    "duracion_potenciador" INTEGER NOT NULL DEFAULT 1,
    "nivel_potenciador" "BoosterLevel" NOT NULL DEFAULT 'medio',

    CONSTRAINT "potenciador_pkey" PRIMARY KEY ("cod_potenciador")
);

-- CreateIndex
CREATE UNIQUE INDEX "potenciador_nombre_potenciador_key" ON "potenciador"("nombre_potenciador");
