const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAchievementsSimple() {
    try {
        const logros = await prisma.$queryRaw`
      SELECT cod_logro, titulo_logro 
      FROM logro 
      ORDER BY cod_logro
    `;

        logros.forEach(l => {
            console.log(`${l.cod_logro}: ${l.titulo_logro}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

listAchievementsSimple();
