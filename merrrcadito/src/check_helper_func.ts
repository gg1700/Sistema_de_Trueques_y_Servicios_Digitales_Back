
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- fn_trans_monto_debito ---');
        const result = await prisma.$queryRaw`
      SELECT pg_get_functiondef(oid) as def
      FROM pg_proc
      WHERE proname = 'fn_trans_monto_debito'
    `;
        console.log(JSON.stringify(result, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
