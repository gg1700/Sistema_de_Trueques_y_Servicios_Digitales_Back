import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEventEnrollment() {
    try {
        const cod_us = 6; // admin_roberto
        const cod_evento = 2; // Assume this is a paid event

        console.log(`\n=== ANTES DE LA INSCRIPCIÓN ===`);

        // Check wallet before
        const walletBefore = await prisma.$queryRaw`
      SELECT saldo_actual FROM BILLETERA WHERE cod_us = ${cod_us}
    ` as any[];
        console.log('Saldo antes:', walletBefore[0]?.saldo_actual || 'No encontrado');

        // Check event cost
        const event = await prisma.$queryRaw`
      SELECT cod_evento, titulo_evento, costo_inscripcion, cod_us_creador 
      FROM EVENTO 
      WHERE cod_evento = ${cod_evento}
    ` as any[];

        if (event.length === 0) {
            console.log('⚠️  Evento no encontrado');
            return;
        }

        console.log('Evento:', event[0].titulo_evento);
        console.log('Costo:', event[0].costo_inscripcion);
        console.log('Creador:', event[0].cod_us_creador || 'NULL (organización)');

        console.log(`\n=== EJECUTANDO INSCRIPCIÓN ===`);

        // Call the SP
        const result = await prisma.$queryRaw`
      SELECT * FROM sp_inscribirEventoConPago(${cod_us}::INTEGER, ${cod_evento}::INTEGER)
    ` as any[];

        console.log('Resultado SP:', result[0]);

        console.log(`\n=== DESPUÉS DE LA INSCRIPCIÓN ===`);

        // Check wallet after
        const walletAfter = await prisma.$queryRaw`
      SELECT saldo_actual FROM BILLETERA WHERE cod_us = ${cod_us}
    ` as any[];
        console.log('Saldo después:', walletAfter[0]?.saldo_actual || 'No encontrado');

        // Check enrollment
        const enrollment = await prisma.$queryRaw`
      SELECT * FROM USUARIO_EVENTO WHERE cod_evento = ${cod_evento} AND cod_us = ${cod_us}
    ` as any[];
        console.log('Inscrito:', enrollment.length > 0 ? 'SÍ' : 'NO');

        // Check latest transaction
        const transaction = await prisma.$queryRaw`
      SELECT cod_trans, desc_trans, monto_regalo, moneda, estado_trans, fecha_trans
      FROM TRANSACCION 
      WHERE cod_us_origen = ${cod_us} 
      ORDER BY fecha_trans DESC 
      LIMIT 1
    ` as any[];

        if (transaction.length > 0) {
            console.log('\nÚltima transacción:');
            console.log('  ID:', transaction[0].cod_trans);
            console.log('  Descripción:', transaction[0].desc_trans);
            console.log('  Monto:', transaction[0].monto_regalo);
            console.log('  Moneda:', transaction[0].moneda);
            console.log('  Estado:', transaction[0].estado_trans);
            console.log('  Fecha:', transaction[0].fecha_trans);
        } else {
            console.log('\n⚠️  No se encontró ninguna transacción');
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testEventEnrollment();
