/*
  Warnings:

  - You are about to drop the `Promocion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Promocion";

-- CreateTable
CREATE TABLE "origanizacion" (
    "cod_org" SERIAL NOT NULL,
    "nom_com_org" VARCHAR(100) NOT NULL,
    "nom_leg_org" VARCHAR(150) NOT NULL,
    "tipo_org" VARCHAR(50) NOT NULL,
    "rubro_org" VARCHAR(100) NOT NULL,
    "cif" VARCHAR(30) NOT NULL,
    "correo_org" VARCHAR(100) NOT NULL,
    "telf_org" VARCHAR(20) NOT NULL,
    "dir_org" VARCHAR(200) NOT NULL,
    "fecha_registro_org" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sitio_web" VARCHAR(150),
    "logo_org" BYTEA,

    CONSTRAINT "origanizacion_pkey" PRIMARY KEY ("cod_org")
);

-- CreateTable
CREATE TABLE "promocion" (
    "cod_prom" SERIAL NOT NULL,
    "titulo_prom" VARCHAR(100) NOT NULL,
    "fecha_ini_prom" TIMESTAMP(6) NOT NULL,
    "duracion_prom" INTEGER NOT NULL,
    "fecha_fin_prom" TIMESTAMP(6) NOT NULL,
    "descr_prom" VARCHAR(300) NOT NULL,
    "banner_prom" BYTEA,
    "descuento_prom" DECIMAL(5,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "promocion_pkey" PRIMARY KEY ("cod_prom")
);

-- CreateIndex
CREATE UNIQUE INDEX "origanizacion_nom_leg_org_key" ON "origanizacion"("nom_leg_org");

-- CreateIndex
CREATE UNIQUE INDEX "origanizacion_cif_key" ON "origanizacion"("cif");

-- CreateIndex
CREATE UNIQUE INDEX "origanizacion_correo_org_key" ON "origanizacion"("correo_org");

-- CreateIndex
CREATE UNIQUE INDEX "origanizacion_telf_org_key" ON "origanizacion"("telf_org");

-- CreateIndex
CREATE UNIQUE INDEX "promocion_titulo_prom_key" ON "promocion"("titulo_prom");
