-- CreateTable
CREATE TABLE "bitacora" (
    "cod_bitacora" SERIAL NOT NULL,
    "cod_acc" INTEGER NOT NULL,
    "cod_trans" INTEGER NOT NULL,
    "cod_camb" INTEGER NOT NULL,
    "cod_inter" INTEGER NOT NULL,

    CONSTRAINT "bitacora_pkey" PRIMARY KEY ("cod_bitacora")
);

-- CreateIndex
CREATE UNIQUE INDEX "bitacora_cod_acc_key" ON "bitacora"("cod_acc");

-- CreateIndex
CREATE UNIQUE INDEX "bitacora_cod_trans_key" ON "bitacora"("cod_trans");

-- CreateIndex
CREATE UNIQUE INDEX "bitacora_cod_camb_key" ON "bitacora"("cod_camb");

-- CreateIndex
CREATE UNIQUE INDEX "bitacora_cod_inter_key" ON "bitacora"("cod_inter");

-- AddForeignKey
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_cod_acc_fkey" FOREIGN KEY ("cod_acc") REFERENCES "acceso"("cod_acc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_cod_trans_fkey" FOREIGN KEY ("cod_trans") REFERENCES "transaccion"("cod_trans") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_cod_camb_fkey" FOREIGN KEY ("cod_camb") REFERENCES "contrasenia"("cod_camb") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_cod_inter_fkey" FOREIGN KEY ("cod_inter") REFERENCES "intercambio"("cod_inter") ON DELETE CASCADE ON UPDATE CASCADE;
