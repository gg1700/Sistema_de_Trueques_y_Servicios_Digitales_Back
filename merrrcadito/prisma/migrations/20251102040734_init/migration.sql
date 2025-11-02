-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('usuario_comun', 'emprendedor', 'administrador');

-- CreateTable
CREATE TABLE "rol" (
    "cod_rol" SERIAL NOT NULL,
    "nom_rol" "RoleName" NOT NULL,
    "descr_rol" VARCHAR(200) NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("cod_rol")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_nom_rol_key" ON "rol"("nom_rol");
