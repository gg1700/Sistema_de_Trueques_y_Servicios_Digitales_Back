
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const result: any[] = await prisma.$queryRaw`SELECT * FROM billetera LIMIT 1`;
        if (result.length > 0) {
            console.log('Columns:', Object.keys(result[0]));
        } else {
            console.log('Table is empty, cannot determine columns from result.');
            // Try to get column info from information_schema
            const columns: any[] = await prisma.$queryRaw`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'billetera'
            `;
            console.log('Schema Columns:', columns.map(c => c.column_name));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
