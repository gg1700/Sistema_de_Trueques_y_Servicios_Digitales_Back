import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPaidEventEnrollment() {
    try {
        const cod_us = 6; // admin_roberto
        const cod_evento = 14; // Mercado Verde Navideño - 50 CV - No inscription yet

        console.log(`\n======== PRUEBA DE INSCRIPCIÓN A EVENTO DE PAGO ========`);
        console.log(`Usuario: ${cod_us} | Evento: ${cod_evento}\n`);

        console.log(`=== PASO 1: ESTADO INICIAL ===`);

        // Check wallet before
        const walletBefore = await prisma.$queryRaw`
      SELECT saldo_actual FROM BILLETERA WHERE cod_us = ${cod_us}
    ` as any[];
        const saldoInicial = parseFloat(walletBefore[0]?.saldo_actual || '0');
        console.log(`✓ Saldo inicial: ${saldoInicial} CV`);

        // Check event details
        const event = await prisma.$queryRaw`
      SELECT cod_evento, titulo_evento, costo_inscripcion, cod_us_creador 
      FROM EVENTO 
      WHERE cod_evento = ${cod_evento}
    ` as any[];

        if (event.length === 0) {
            console.log('❌ Evento no encontrado\n');
            return;
        }

        const costoEvento = parseFloat(event[0].costo_inscripcion);
        console.log(`✓ Evento: "${event[0].titulo_evento}"`);
        console.log(`✓ Costo: ${costoEvento} CV`);
        console.log(`✓ Creador: ${event[0].cod_us_creador || 'NULL (organización)'}`);

        // Check if already enrolled
        const enrolled = await prisma.$queryRaw`
      SELECT * FROM USUARIO_EVENTO WHERE cod_evento = ${cod_evento} AND cod_us = ${cod_us}
    ` as any[];

        if (enrolled.length > 0) {
            console.log('⚠️  Usuario ya estaba inscrito en este evento\n');
            return;
        }
        console.log(`✓ Usuario NO inscrito previamente`);

        console.log(`\n=== PASO 2: EJECUTAR STORED PROCEDURE ===`);

        // Call the SP
        const result = await prisma.$queryRaw`
      SELECT * FROM sp_inscribirEventoConPago(${cod_us}::INTEGER, ${cod_evento}::INTEGER)
    ` as any[];

        console.log(`Resultado: success=${result[0].success}, message="${result[0].message}"`);

        if (!result[0].success) {
            console.log(`❌ La inscripción falló: ${result[0].message}\n`);
            return;
        }

        console.log(`\n=== PASO 3: VERIFICAR CAMBIOS ===`);

        // Check wallet after
        const walletAfter = await prisma.$queryRaw`
      SELECT saldo_actual FROM BILLETERA WHERE cod_us = ${cod_us}
    ` as any[];
        const saldoFinal = parseFloat(walletAfter[0]?.saldo_actual || '0');
        const diferenciaEsperada = costoEvento;
        const diferenciaReal = saldoInicial - saldoFinal;

        console.log(`Saldo antes:    ${saldoInicial} CV`);
        console.log(`Saldo después:  ${saldoFinal} CV`);
        console.log(`Diferencia:     ${diferenciaReal} CV`);
        console.log(`Esperado:       ${diferenciaEsperada} CV`);

        if (Math.abs(diferenciaReal - diferenciaEsperada) < 0.01) {
            console.log(`✅ SALDO ACTUALIZADO CORRECTAMENTE`);
        } else {
            console.log(`❌ ERROR: El saldo no se actualizó correctamente`);
        }

        // Check enrollment
        const enrollmentAfter = await prisma.$queryRaw`
      SELECT * FROM USUARIO_EVENTO WHERE cod_evento = ${cod_evento} AND cod_us = ${cod_us}
    ` as any[];
        console.log(`\nInscripción: ${enrollmentAfter.length > 0 ? '✅ SÍ' : '❌ NO'}`);

        // Check latest transaction
        const transaction = await prisma.$queryRaw`
      SELECT cod_trans, cod_evento, desc_trans, moneda, estado_trans, fecha_trans
      FROM TRANSACCION 
      WHERE cod_us_origen = ${cod_us} 
      AND cod_evento = ${cod_evento}
      ORDER BY fecha_trans DESC 
      LIMIT 1
    ` as any[];

        if (transaction.length > 0) {
            console.log(`\nTransacción creada:`);
            console.log(`  ✓ ID: ${transaction[0].cod_trans}`);
            console.log(`  ✓ Evento: ${transaction[0].cod_evento}`);
            console.log(`  ✓ Descripción: "${transaction[0].desc_trans}"`);
            console.log(`  ✓ Moneda: ${transaction[0].moneda}`);
            console.log(`  ✓ Estado: ${transaction[0].estado_trans}`);
            console.log(`  ✓ Fecha: ${transaction[0].fecha_trans}`);
        } else {
            console.log(`\n❌ NO SE CREÓ LA TRANSACCIÓN`);
        }

        console.log(`\n======== FIN DE LA PRUEBA ========\n`);

    } catch (error) {
        console.error('\n❌ ERROR DURANTE LA PRUEBA:', error);
        if (error instanceof Error) {
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
        }
    } finally {
        await prisma.$disconnect();
    }
}

testPaidEventEnrollment();
