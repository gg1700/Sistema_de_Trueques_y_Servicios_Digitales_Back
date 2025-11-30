import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Adding impacto_amb_inter column to EVENTO table...');
        await prisma.$executeRaw`
      ALTER TABLE "evento" 
      ADD COLUMN IF NOT EXISTS "impacto_amb_inter" NUMERIC(10,2) DEFAULT 10.0;
    `;
        console.log('Column added successfully.');

        // Opcional: Migrar datos existentes si se desea que los eventos viejos tengan impacto
        // await prisma.$executeRaw`UPDATE evento SET impacto_amb_inter = 10.0 WHERE impacto_amb_inter IS NULL`;

    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
