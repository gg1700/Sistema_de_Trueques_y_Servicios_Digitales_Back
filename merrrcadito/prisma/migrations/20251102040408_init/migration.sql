-- CreateEnum
CREATE TYPE "AdvertenceState" AS ENUM ('revisado', 'no_revisado');

-- CreateEnum
CREATE TYPE "AdvertenceReason" AS ENUM ('incumplimiento', 'contenido_indebido', 'lenguaje_inapropiado');

-- CreateTable
CREATE TABLE "advertencia" (
    "cod_adv" SERIAL NOT NULL,
    "motivo_adv" "AdvertenceReason" NOT NULL,
    "fecha_emision" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_adv" "AdvertenceState" NOT NULL DEFAULT 'no_revisado',

    CONSTRAINT "advertencia_pkey" PRIMARY KEY ("cod_adv")
);
