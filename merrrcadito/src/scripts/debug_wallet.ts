import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugWallet() {
    try {
        const cod_us = 6; // admin_roberto

        console.log('\n=== DEPURANDO WALLET API ===\n');

        const walletData = await prisma.$queryRaw`
      SELECT 
        b.cod_bill as cod_billetera,
        b.cod_us,
        b.cuenta_bancaria,
        b.saldo_real,
        b.saldo_actual as saldo_creditos,
        (
          SELECT MAX(t.fecha_trans) 
          FROM transaccion t 
          WHERE t.cod_us_origen = ${cod_us}::INTEGER OR t.cod_us_destino = ${cod_us}::INTEGER
        ) as fecha_ultima_trans
      FROM billetera b
      WHERE b.cod_us = ${cod_us}::INTEGER
    ` as any[];

        console.log('Datos de billetera (exactamente como los devuelve el backend):');
        console.log(JSON.stringify(walletData, null, 2));

        if (walletData.length > 0) {
            const wallet = walletData[0];
            console.log('\nCampos individuales:');
            console.log('  cod_billetera:', wallet.cod_billetera);
            console.log('  cod_us:', wallet.cod_us);
            console.log('  cuenta_bancaria:', wallet.cuenta_bancaria);
            console.log('  saldo_real:', wallet.saldo_real);
            console.log('  saldo_creditos:', wallet.saldo_creditos);
            console.log('  saldo_actual:', wallet.saldo_actual);

            console.log('\nTipos de datos:');
            console.log('  typeof saldo_creditos:', typeof wallet.saldo_creditos);
            console.log('  typeof saldo_actual:', typeof wallet.saldo_actual);
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugWallet();
