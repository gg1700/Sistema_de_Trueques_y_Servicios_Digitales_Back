/*
  Warnings:

  - Changed the type of `calidad_logro` on the `logro` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AchievementQuality" AS ENUM ('Legendario', 'Epico', 'Especial', 'Comun');

-- CreateEnum
CREATE TYPE "ServiceState" AS ENUM ('disponible', 'no_disponible');

-- AlterTable
ALTER TABLE "logro" DROP COLUMN "calidad_logro",
ADD COLUMN     "calidad_logro" "AchievementQuality" NOT NULL;

-- DropEnum
DROP TYPE "public"."achievementQuality";

-- CreateTable
CREATE TABLE "servicio" (
    "cod_serv" SERIAL NOT NULL,
    "cod_cat" INTEGER NOT NULL,
    "nom_serv" VARCHAR(100) NOT NULL,
    "desc_serv" VARCHAR(200),
    "estado_serv" "ServiceState" NOT NULL DEFAULT 'disponible',
    "precio_serv" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "duracion_serv" INTEGER NOT NULL DEFAULT 0,
    "dif_dist_serv" DECIMAL(10,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "servicio_pkey" PRIMARY KEY ("cod_serv")
);

-- CreateIndex
CREATE UNIQUE INDEX "servicio_nom_serv_key" ON "servicio"("nom_serv");

-- AddForeignKey
ALTER TABLE "servicio" ADD CONSTRAINT "servicio_cod_cat_fkey" FOREIGN KEY ("cod_cat") REFERENCES "categoria"("cod_cat") ON DELETE CASCADE ON UPDATE CASCADE;
