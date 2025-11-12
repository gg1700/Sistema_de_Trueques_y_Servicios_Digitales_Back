-- CreateEnum
CREATE TYPE "achievementQuality" AS ENUM ('Legendario', 'Epico', 'Especial', 'Comun');

-- CreateTable
CREATE TABLE "logro" (
    "cod_logro" SERIAL NOT NULL,
    "titulo_logro" VARCHAR(100) NOT NULL,
    "descr_logro" VARCHAR(200) NOT NULL,
    "icono_logro" BYTEA NOT NULL,
    "calidad_logro" "achievementQuality" NOT NULL,

    CONSTRAINT "logro_pkey" PRIMARY KEY ("cod_logro")
);

-- CreateIndex
CREATE UNIQUE INDEX "logro_titulo_logro_key" ON "logro"("titulo_logro");
