const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAchievements() {
    try {
        const logros = await prisma.$queryRaw`
      SELECT cod_logro, titulo_logro, descr_logro 
      FROM logro 
      ORDER BY cod_logro
    `;

        console.log('Logros disponibles:');
        console.log(JSON.stringify(logros, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

listAchievements();
