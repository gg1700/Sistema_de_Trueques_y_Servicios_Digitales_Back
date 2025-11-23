
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const cod_us = 7;
    console.log(`Checking ORIGIN transactions for user ${cod_us}...`);

    try {
        const rawResult: any[] = await prisma.$queryRaw`
        SELECT t.cod_trans, t.fecha_trans, t.cod_us_origen, t.cod_us_destino
        FROM transaccion t
        WHERE t.cod_us_origen = ${cod_us}
        ORDER BY t.fecha_trans DESC
        LIMIT 5
    `;

        console.log("Raw Query Result (Origin Only):");
        if (rawResult.length === 0) {
            console.log("No transactions found where user is origin.");
        } else {
            rawResult.forEach(t => {
                console.log(`ID: ${t.cod_trans}, Date: ${t.fecha_trans}, Origin: ${t.cod_us_origen}, Dest: ${t.cod_us_destino}`);
            });
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
