-- AddForeignKey
ALTER TABLE "transaccion" ADD CONSTRAINT "transaccion_cod_pub_fkey" FOREIGN KEY ("cod_pub") REFERENCES "publicacion"("cod_pub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaccion" ADD CONSTRAINT "transaccion_cod_evento_fkey" FOREIGN KEY ("cod_evento") REFERENCES "evento"("cod_evento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaccion" ADD CONSTRAINT "transaccion_cod_potenciador_fkey" FOREIGN KEY ("cod_potenciador") REFERENCES "potenciador"("cod_potenciador") ON DELETE CASCADE ON UPDATE CASCADE;
