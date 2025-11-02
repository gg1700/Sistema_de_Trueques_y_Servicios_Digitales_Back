-- CreateEnum
CREATE TYPE "EventState" AS ENUM ('vigente', 'finalizado');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('benefico', 'monetizable');

-- CreateTable
CREATE TABLE "evento" (
    "cod_evento" SERIAL NOT NULL,
    "cod_org" INTEGER NOT NULL,
    "titulo_evento" VARCHAR(100) NOT NULL,
    "descripcion_evento" VARCHAR(200) NOT NULL,
    "fecha_registro_evento" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_inicio_evento" DATE NOT NULL,
    "fecha_finalizacion_evento" DATE NOT NULL,
    "duracion_evento" INTEGER NOT NULL DEFAULT 0,
    "banner_evento" BYTEA,
    "cant_personas_inscritas" INTEGER NOT NULL DEFAULT 0,
    "ganancia_evento" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "estado_evento" "EventState" NOT NULL DEFAULT 'vigente',
    "tipo_evento" "EventType" NOT NULL,
    "costo_inscripcion" DECIMAL(12,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "evento_pkey" PRIMARY KEY ("cod_evento")
);

-- CreateIndex
CREATE UNIQUE INDEX "evento_titulo_evento_key" ON "evento"("titulo_evento");

-- AddForeignKey
ALTER TABLE "evento" ADD CONSTRAINT "evento_cod_org_fkey" FOREIGN KEY ("cod_org") REFERENCES "origanizacion"("cod_org") ON DELETE CASCADE ON UPDATE CASCADE;
