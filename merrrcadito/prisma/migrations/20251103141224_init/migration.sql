-- CreateEnum
CREATE TYPE "AchievementState" AS ENUM ('en_progreso', 'completado');

-- CreateTable
CREATE TABLE "usuario_logro" (
    "cod_us" INTEGER NOT NULL,
    "cod_logro" INTEGER NOT NULL,
    "progreso" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "estado_logro" "AchievementState" NOT NULL DEFAULT 'en_progreso',
    "fecha_obtencion_logro" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_logro_pkey" PRIMARY KEY ("cod_us","cod_logro")
);

-- AddForeignKey
ALTER TABLE "usuario_logro" ADD CONSTRAINT "usuario_logro_cod_us_fkey" FOREIGN KEY ("cod_us") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_logro" ADD CONSTRAINT "usuario_logro_cod_logro_fkey" FOREIGN KEY ("cod_logro") REFERENCES "logro"("cod_logro") ON DELETE CASCADE ON UPDATE CASCADE;
