const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQualities() {
    try {
        const qualities = await prisma.$queryRaw`
      SELECT DISTINCT calidad_logro FROM logro
    `;
        console.log('Calidades encontradas:', qualities);
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkQualities();
