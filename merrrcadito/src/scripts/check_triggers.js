const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const triggers = await prisma.$queryRaw`
    SELECT tgname, tgrelid::regclass::text as tabla
    FROM pg_trigger
    WHERE tgname LIKE '%achievement%' AND NOT tgisinternal
  `;

    console.log(`\nTriggers instalados: ${triggers.length}`);
    triggers.forEach(t => console.log(`  ✓ ${t.tgname} → ${t.tabla}`));

    await prisma.$disconnect();
}

check();
