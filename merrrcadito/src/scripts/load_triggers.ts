import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function loadTriggers() {
    try {
        console.log('Loading and executing Triggers.sql...\n');

        const triggersPath = path.join(__dirname, '..', 'db', 'Triggers.sql');
        const triggersSql = fs.readFileSync(triggersPath, 'utf-8');

        // Execute the SQL file
        await prisma.$executeRawUnsafe(triggersSql);

        console.log('✅ Triggers.sql executed successfully\n');

        // Verify triggers were created
        const triggers = await prisma.$queryRaw`
      SELECT 
        trigger_name,
        event_manipulation,
        action_timing
      FROM information_schema.triggers
      WHERE event_object_table = 'transaccion'
      ORDER BY action_timing, event_manipulation, trigger_name
    ` as any[];

        console.log(`\nTriggers created on transaccion table: ${triggers.length}\n`);
        triggers.forEach((t, i) => {
            console.log(`${i + 1}. ${t.trigger_name} (${t.action_timing} ${t.event_manipulation})`);
        });
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

loadTriggers();
