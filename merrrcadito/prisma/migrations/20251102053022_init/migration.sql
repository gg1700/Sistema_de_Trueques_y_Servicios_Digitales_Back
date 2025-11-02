-- CreateTable
CREATE TABLE "recompensa_logro" (
    "cod_rec" INTEGER NOT NULL,
    "cod_logro" INTEGER NOT NULL,

    CONSTRAINT "recompensa_logro_pkey" PRIMARY KEY ("cod_rec","cod_logro")
);

-- AddForeignKey
ALTER TABLE "recompensa_logro" ADD CONSTRAINT "recompensa_logro_cod_rec_fkey" FOREIGN KEY ("cod_rec") REFERENCES "recompensa"("cod_rec") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recompensa_logro" ADD CONSTRAINT "recompensa_logro_cod_logro_fkey" FOREIGN KEY ("cod_logro") REFERENCES "logro"("cod_logro") ON DELETE CASCADE ON UPDATE CASCADE;
