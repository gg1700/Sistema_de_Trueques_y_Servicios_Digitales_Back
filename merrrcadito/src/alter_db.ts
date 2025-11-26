
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Altering table intercambio...');
        await prisma.$executeRawUnsafe(`ALTER TABLE intercambio ALTER COLUMN cod_us_1 DROP NOT NULL;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE intercambio ALTER COLUMN unidad_medida_origen DROP NOT NULL;`);
        console.log('Table altered successfully.');
    } catch (error) {
        console.error('Error altering table:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
