const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEnum() {
    try {
        const result = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AchievementState')
    `;

        console.log('Valores del enum AchievementState:');
        result.forEach(r => console.log('  -', r.enumlabel));

        // También verificar la tabla usuario_logro
        const sample = await prisma.$queryRaw`
      SELECT estado_logro::text as estado
      FROM usuario_logro
      LIMIT 1
    `;

        if (sample.length > 0) {
            console.log('\nEjemplo de estado en BD:', sample[0].estado);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkEnum();
