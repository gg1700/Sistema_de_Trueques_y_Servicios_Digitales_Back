
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- trg_after_trans_aplicar_saldos ---');
        const result = await prisma.$queryRaw`
      SELECT pg_get_functiondef(oid) as def
      FROM pg_proc
      WHERE proname = 'trg_after_trans_aplicar_saldos'
    `;
        console.log(JSON.stringify(result, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
