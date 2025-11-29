
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- User 1 Wallet ---');
    const wallet = await prisma.$queryRaw`SELECT * FROM billetera WHERE cod_us = 1`;
    console.log(wallet);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
