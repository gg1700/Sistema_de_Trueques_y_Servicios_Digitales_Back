import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Adding cod_us_creador column to EVENTO table...');
        await prisma.$executeRaw`
      ALTER TABLE "evento" 
      ADD COLUMN IF NOT EXISTS "cod_us_creador" INTEGER REFERENCES "usuario"("cod_us");
    `;
        console.log('Column added successfully.');
    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
