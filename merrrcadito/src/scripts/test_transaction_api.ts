import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTransactionAPI() {
    try {
        const cod_us = 6;

        console.log('\n=== PROBANDO get_user_transaction_history ===\n');

        const transaction_history = await prisma.$queryRaw`
      SELECT * FROM sp_obtenerhistorialtransaccionesusuario(${cod_us}::INTEGER)
    ` as any[];

        console.log(`Total transacciones: ${transaction_history.length}\n`);

        // Mostrar solo la transacción 869
        const trans869 = transaction_history.find((t: any) => t.cod_trans === 869);

        if (trans869) {
            console.log('Transacción 869:');
            console.log(JSON.stringify(trans869, null, 2));
            console.log('\nCampos importantes:');
            console.log('  cod_trans:', trans869.cod_trans);
            console.log(' cod_evento:', trans869.cod_evento);
            console.log('  monto_regalo:', trans869.monto_regalo);
            console.log('  monto_pagado:', trans869.monto_pagado);
            console.log('  desc_trans:', trans869.desc_trans);
        } else {
            console.log('Transacción 869 no encontrada en el historial');
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testTransactionAPI();
