-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('CV', 'Bs');

-- CreateEnum
CREATE TYPE "TransactionState" AS ENUM ('satisfactorio', 'no_satisfactorio');

-- CreateTable
CREATE TABLE "transaccion" (
    "cod_trans" SERIAL NOT NULL,
    "cod_us_origen" INTEGER NOT NULL,
    "cod_us_destino" INTEGER NOT NULL,
    "cod_pub" INTEGER NOT NULL,
    "cod_evento" INTEGER NOT NULL,
    "cod_potenciador" INTEGER NOT NULL,
    "desc_trans" VARCHAR(200) NOT NULL,
    "fecha_trans" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moneda" "Currency" NOT NULL DEFAULT 'CV',
    "monto_regalo" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "estado_trans" "TransactionState" NOT NULL DEFAULT 'no_satisfactorio',

    CONSTRAINT "transaccion_pkey" PRIMARY KEY ("cod_trans")
);

-- AddForeignKey
ALTER TABLE "transaccion" ADD CONSTRAINT "transaccion_cod_us_origen_fkey" FOREIGN KEY ("cod_us_origen") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaccion" ADD CONSTRAINT "transaccion_cod_us_destino_fkey" FOREIGN KEY ("cod_us_destino") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
