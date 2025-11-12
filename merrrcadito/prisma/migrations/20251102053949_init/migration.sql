-- CreateTable
CREATE TABLE "promocion_servicio" (
    "cod_prom" INTEGER NOT NULL,
    "cod_serv" INTEGER NOT NULL,

    CONSTRAINT "promocion_servicio_pkey" PRIMARY KEY ("cod_prom","cod_serv")
);

-- AddForeignKey
ALTER TABLE "promocion_servicio" ADD CONSTRAINT "promocion_servicio_cod_prom_fkey" FOREIGN KEY ("cod_prom") REFERENCES "promocion"("cod_prom") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocion_servicio" ADD CONSTRAINT "promocion_servicio_cod_serv_fkey" FOREIGN KEY ("cod_serv") REFERENCES "servicio"("cod_serv") ON DELETE CASCADE ON UPDATE CASCADE;
