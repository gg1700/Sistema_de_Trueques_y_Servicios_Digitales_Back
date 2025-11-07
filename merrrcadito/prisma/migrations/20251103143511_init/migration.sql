-- CreateTable
CREATE TABLE "publicacion_servicio" (
    "cod_pub" INTEGER NOT NULL,
    "cod_serv" INTEGER NOT NULL,
    "hrs_ini_dia_serv" TIME(6) NOT NULL,
    "hrs_fin_dia_serv" TIME(6) NOT NULL,

    CONSTRAINT "publicacion_servicio_pkey" PRIMARY KEY ("cod_pub","cod_serv")
);

-- AddForeignKey
ALTER TABLE "publicacion_servicio" ADD CONSTRAINT "publicacion_servicio_cod_pub_fkey" FOREIGN KEY ("cod_pub") REFERENCES "publicacion"("cod_pub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacion_servicio" ADD CONSTRAINT "publicacion_servicio_cod_serv_fkey" FOREIGN KEY ("cod_serv") REFERENCES "servicio"("cod_serv") ON DELETE CASCADE ON UPDATE CASCADE;
