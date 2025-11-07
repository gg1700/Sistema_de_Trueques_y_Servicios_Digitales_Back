-- CreateTable
CREATE TABLE "usuario_evento" (
    "cod_evento" INTEGER NOT NULL,
    "cod_us" INTEGER NOT NULL,

    CONSTRAINT "usuario_evento_pkey" PRIMARY KEY ("cod_evento","cod_us")
);

-- AddForeignKey
ALTER TABLE "usuario_evento" ADD CONSTRAINT "usuario_evento_cod_evento_fkey" FOREIGN KEY ("cod_evento") REFERENCES "evento"("cod_evento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_evento" ADD CONSTRAINT "usuario_evento_cod_us_fkey" FOREIGN KEY ("cod_us") REFERENCES "usuario"("cod_us") ON DELETE CASCADE ON UPDATE CASCADE;
