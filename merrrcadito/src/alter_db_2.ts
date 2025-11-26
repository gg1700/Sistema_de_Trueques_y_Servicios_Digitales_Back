
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Altering table intercambio_producto...');
        await prisma.$executeRawUnsafe(`ALTER TABLE intercambio_producto ALTER COLUMN cod_prod_origen DROP NOT NULL;`);
        console.log('Table altered successfully.');
    } catch (error) {
        console.error('Error altering table:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
