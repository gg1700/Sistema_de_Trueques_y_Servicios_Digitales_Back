-- CreateTable
CREATE TABLE "disponibilidad" (
    "cod_disp" SERIAL NOT NULL,
    "hora_ini" VARCHAR(10) NOT NULL,
    "hora_fin" VARCHAR(10) NOT NULL,
    "fecha_dia" DATE NOT NULL,

    CONSTRAINT "disponibilidad_pkey" PRIMARY KEY ("cod_disp")
);
