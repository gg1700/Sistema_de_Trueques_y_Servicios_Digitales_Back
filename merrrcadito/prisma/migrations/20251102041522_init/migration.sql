-- AlterTable
ALTER TABLE "rol" ALTER COLUMN "nom_rol" SET DEFAULT 'usuario_comun';

-- CreateTable
CREATE TABLE "recompensa" (
    "cod_rec" SERIAL NOT NULL,
    "monto_rec" DECIMAL(12,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "recompensa_pkey" PRIMARY KEY ("cod_rec")
);
