
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Triggers on transaccion ---');
        const result1 = await prisma.$queryRaw`
      SELECT event_object_table, trigger_name, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'transaccion'
    `;
        console.log(JSON.stringify(result1, null, 2));

        console.log('\n--- Triggers on escrow ---');
        const result2 = await prisma.$queryRaw`
      SELECT event_object_table, trigger_name, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'escrow'
    `;
        console.log(JSON.stringify(result2, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
