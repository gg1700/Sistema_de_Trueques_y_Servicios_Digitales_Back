-- CreateTable
CREATE TABLE "contrasenia" (
    "cod_camb" SERIAL NOT NULL,
    "cod_us" INTEGER NOT NULL,
    "fecha_camb" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correo_acc" VARCHAR(100) NOT NULL,
    "contra_prev" VARCHAR(100) NOT NULL,
    "contra_nueva" VARCHAR(100) NOT NULL,

    CONSTRAINT "contrasenia_pkey" PRIMARY KEY ("cod_camb")
);

-- AddForeignKey
ALTER TABLE "contrasenia" ADD CONSTRAINT "contrasenia_cod_us_fkey" FOREIGN KEY ("cod_us") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
