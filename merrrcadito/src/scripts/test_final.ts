import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAfterTriggers() {
    try {
        const cod_us = 6; // admin_roberto
        const cod_evento = 15; // Simposio Economía Circular - 200 CV - Not enrolled yet

        console.log(`\n======== PRUEBA FINAL CON TRIGGERS ACTIVADOS ========`);
        console.log(`Usuario: ${cod_us} | Evento: ${cod_evento}\n`);

        console.log(`=== ESTADO INICIAL ===`);

        const walletBefore = await prisma.$queryRaw`
      SELECT saldo_actual FROM BILLETERA WHERE cod_us = ${cod_us}
    ` as any[];
        const saldoInicial = parseFloat(walletBefore[0]?.saldo_actual || '0');
        console.log(`Saldo inicial: ${saldoInicial} CV`);

        const event = await prisma.$queryRaw`
      SELECT cod_evento, titulo_evento, costo_inscripcion
      FROM EVENTO 
      WHERE cod_evento = ${cod_evento}
    ` as any[];

        if (event.length === 0) {
            console.log('❌ Evento no encontrado\n');
            return;
        }

        const costoEvento = parseFloat(event[0].costo_inscripcion);
        console.log(`Evento: "${event[0].titulo_evento}"`);
        console.log(`Costo: ${costoEvento} CV`);

        const saldoEsperado = saldoInicial - costoEvento;

        console.log(`\n=== EJECUTANDO INSCRIPCIÓN ===`);

        const result = await prisma.$queryRaw`
      SELECT * FROM sp_inscribirEventoConPago(${cod_us}::INTEGER, ${cod_evento}::INTEGER)
    ` as any[];

        console.log(`Resultado: success=${result[0].success}, message="${result[0].message}"`);

        if (!result[0].success) {
            console.log(`❌ La inscripción falló\n`);
            return;
        }

        console.log(`\n=== VERIFICACIÓN FINAL ===`);

        const walletAfter = await prisma.$queryRaw`
      SELECT saldo_actual FROM BILLETERA WHERE cod_us = ${cod_us}
    ` as any[];
        const saldoFinal = parseFloat(walletAfter[0]?.saldo_actual || '0');

        console.log(`Saldo inicial:  ${saldoInicial} CV`);
        console.log(`Costo evento:   ${costoEvento} CV`);
        console.log(`Saldo esperado: ${saldoEsperado} CV`);
        console.log(`Saldo final:    ${saldoFinal} CV`);

        if (Math.abs(saldoFinal - saldoEsperado) < 0.01) {
            console.log(`\n✅✅✅ ÉXITO: El saldo se actualizó correctamente! ✅✅✅`);
        } else {
            console.log(`\n❌ ERROR: El saldo no coincide`);
        }

        const transaction = await prisma.$queryRaw`
      SELECT cod_trans, desc_trans, moneda, estado_trans
      FROM TRANSACCION 
      WHERE cod_us_origen = ${cod_us} 
      AND cod_evento = ${cod_evento}
      ORDER BY fecha_trans DESC 
      LIMIT 1
    ` as any[];

        if (transaction.length > 0) {
            console.log(`\nTransacción registrada:`);
            console.log(`  ID: ${transaction[0].cod_trans}`);
            console.log(`  "${transaction[0].desc_trans}"`);
            console.log(`  ${transaction[0].moneda} - ${transaction[0].estado_trans}`);
        }

        console.log(`\n======== FIN DE LA PRUEBA ========\n`);

    } catch (error) {
        console.error('\n❌ ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAfterTriggers();
