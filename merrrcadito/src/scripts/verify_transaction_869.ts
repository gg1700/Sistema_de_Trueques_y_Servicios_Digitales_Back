import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTransaction869() {
    try {
        console.log('\n=== VERIFICANDO TRANSACCIÓN 869 ===\n');

        const transaction = await prisma.$queryRaw`
      SELECT 
        t.cod_trans,
        t.cod_us_origen,
        t.cod_us_destino,
        t.cod_pub,
        t.cod_evento,
        t.cod_potenciador,
        t.desc_trans,
        t.fecha_trans,
        t.moneda,
        t.monto_regalo,
        t.estado_trans
      FROM TRANSACCION t
      WHERE t.cod_trans = 869
    ` as any[];

        console.log('Datos de la transacción:');
        console.log(JSON.stringify(transaction, null, 2));

        if (transaction.length > 0) {
            const t = transaction[0];
            console.log('\nCampos importantes:');
            console.log('  cod_trans:', t.cod_trans);
            console.log('  cod_evento:', t.cod_evento);
            console.log('  monto_regalo:', t.monto_regalo);
            console.log('  moneda:', t.moneda);

            if (t.cod_evento) {
                console.log('\n=== VERIFICANDO EVENTO ===');
                const event = await prisma.$queryRaw`
          SELECT cod_evento, titulo_evento, costo_inscripcion
          FROM EVENTO
          WHERE cod_evento = ${t.cod_evento}
        ` as any[];

                if (event.length > 0) {
                    console.log('Evento:', event[0].titulo_evento);
                    console.log('Costo:', event[0].costo_inscripcion);
                }
            }

            console.log('\n=== VERIFICANDO SALDOS ===');
            const wallet = await prisma.$queryRaw`
        SELECT saldo_actual FROM BILLETERA WHERE cod_us = ${t.cod_us_origen}
      ` as any[];

            if (wallet.length > 0) {
                console.log('Saldo actual usuario:', wallet[0].saldo_actual);
            }
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTransaction869();
