import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTransaction870() {
    try {
        console.log('\n=== VERIFICANDO TRANSACCIÓN 870 ===\n');

        const transaction = await prisma.$queryRaw`
      SELECT 
        t.*,
        e.titulo_evento,
        e.costo_inscripcion,
        e.cod_us_creador
      FROM TRANSACCION t
      LEFT JOIN EVENTO e ON t.cod_evento = e.cod_evento
      WHERE t.cod_trans = 870
    ` as any[];

        if (transaction.length > 0) {
            console.log('Transacción completa:');
            console.log(JSON.stringify(transaction[0], null, 2));
        } else {
            console.log('Transacción 870 no encontrada');
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTransaction870();
