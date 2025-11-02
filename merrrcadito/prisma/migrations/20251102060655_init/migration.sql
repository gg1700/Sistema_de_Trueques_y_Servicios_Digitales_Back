-- CreateTable
CREATE TABLE "evento_recompensa" (
    "cod_evento" INTEGER NOT NULL,
    "cod_rec" INTEGER NOT NULL,

    CONSTRAINT "evento_recompensa_pkey" PRIMARY KEY ("cod_evento","cod_rec")
);

-- AddForeignKey
ALTER TABLE "evento_recompensa" ADD CONSTRAINT "evento_recompensa_cod_evento_fkey" FOREIGN KEY ("cod_evento") REFERENCES "evento"("cod_evento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_recompensa" ADD CONSTRAINT "evento_recompensa_cod_rec_fkey" FOREIGN KEY ("cod_rec") REFERENCES "recompensa"("cod_rec") ON DELETE CASCADE ON UPDATE CASCADE;
