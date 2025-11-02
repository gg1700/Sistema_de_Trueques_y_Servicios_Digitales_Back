-- CreateEnum
CREATE TYPE "AccessState" AS ENUM ('exitoso', 'no_exitoso', 'logout');

-- CreateTable
CREATE TABLE "acceso" (
    "cod_acc" SERIAL NOT NULL,
    "cod_us" INTEGER NOT NULL,
    "estado_acc" "AccessState" NOT NULL,
    "fecha_acc" TIMESTAMP(6) NOT NULL,
    "contra_acc" VARCHAR(100) NOT NULL,

    CONSTRAINT "acceso_pkey" PRIMARY KEY ("cod_acc")
);

-- AddForeignKey
ALTER TABLE "acceso" ADD CONSTRAINT "acceso_cod_us_fkey" FOREIGN KEY ("cod_us") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
