-- CreateTable
CREATE TABLE "usuario_advertencia" (
    "cod_adv" INTEGER NOT NULL,
    "cod_us" INTEGER NOT NULL,

    CONSTRAINT "usuario_advertencia_pkey" PRIMARY KEY ("cod_adv","cod_us")
);

-- AddForeignKey
ALTER TABLE "usuario_advertencia" ADD CONSTRAINT "usuario_advertencia_cod_adv_fkey" FOREIGN KEY ("cod_adv") REFERENCES "advertencia"("cod_adv") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_advertencia" ADD CONSTRAINT "usuario_advertencia_cod_us_fkey" FOREIGN KEY ("cod_us") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
