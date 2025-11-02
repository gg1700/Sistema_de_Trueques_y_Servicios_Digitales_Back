-- CreateTable
CREATE TABLE "billetera" (
    "cod_bill" SERIAL NOT NULL,
    "cod_us" INTEGER NOT NULL,
    "cuenta_bancaria" VARCHAR(50) NOT NULL,
    "saldo_actual" DECIMAL(12,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "billetera_pkey" PRIMARY KEY ("cod_bill")
);

-- CreateIndex
CREATE UNIQUE INDEX "billetera_cod_us_key" ON "billetera"("cod_us");

-- CreateIndex
CREATE UNIQUE INDEX "billetera_cuenta_bancaria_key" ON "billetera"("cuenta_bancaria");

-- AddForeignKey
ALTER TABLE "billetera" ADD CONSTRAINT "billetera_cod_us_fkey" FOREIGN KEY ("cod_us") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
