-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "UserState" AS ENUM ('activo', 'suspendido', 'inactivo');

-- CreateTable
CREATE TABLE "usuario" (
    "cod_us" SERIAL NOT NULL,
    "cod_rol" INTEGER NOT NULL,
    "cod_disp" INTEGER NOT NULL,
    "ci" VARCHAR(20) NOT NULL,
    "nom_us" VARCHAR(100) NOT NULL,
    "handle_name" VARCHAR(50) NOT NULL,
    "ap_pat_us" VARCHAR(50) NOT NULL,
    "ap_mat_us" VARCHAR(50) NOT NULL,
    "contra_us" VARCHAR(100) NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "sexo" "Sex" NOT NULL,
    "estado_us" "UserState" NOT NULL DEFAULT 'activo',
    "correo_us" VARCHAR(100) NOT NULL,
    "telefono_us" VARCHAR(20) NOT NULL,
    "foto_us" BYTEA,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("cod_us")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_ci_key" ON "usuario"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_handle_name_key" ON "usuario"("handle_name");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_cod_rol_fkey" FOREIGN KEY ("cod_rol") REFERENCES "rol"("cod_rol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_cod_disp_fkey" FOREIGN KEY ("cod_disp") REFERENCES "disponibilidad"("cod_disp") ON DELETE CASCADE ON UPDATE CASCADE;
