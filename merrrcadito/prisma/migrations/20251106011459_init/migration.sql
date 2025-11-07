-- CreateEnum
CREATE TYPE "EscrowState" AS ENUM ('liberado', 'retenido');

-- CreateTable
CREATE TABLE "escrow" (
    "cod_escrow" SERIAL NOT NULL,
    "estado_escrow" "EscrowState" NOT NULL DEFAULT 'retenido',
    "cod_trans" INTEGER NOT NULL,

    CONSTRAINT "escrow_pkey" PRIMARY KEY ("cod_escrow")
);

-- AddForeignKey
ALTER TABLE "escrow" ADD CONSTRAINT "escrow_cod_trans_fkey" FOREIGN KEY ("cod_trans") REFERENCES "transaccion"("cod_trans") ON DELETE CASCADE ON UPDATE CASCADE;
