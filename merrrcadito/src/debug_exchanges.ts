
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DEBUGGING EXCHANGES ---');

    // 1. Count total exchanges
    const countIntercambios: any[] = await prisma.$queryRaw`SELECT COUNT(*) as count FROM intercambio`;
    const totalIntercambios = Number(countIntercambios[0].count);
    console.log(`Total rows in 'intercambio': ${totalIntercambios}`);

    // 2. Count total intercambio_producto
    const countResult: any[] = await prisma.$queryRaw`SELECT COUNT(*) as count FROM intercambio_producto`;
    const totalIntercambioProductos = Number(countResult[0].count);
    console.log(`Total rows in 'intercambio_producto': ${totalIntercambioProductos}`);

    // 3. List all exchanges with their details
    const exchanges = await prisma.$queryRaw`
        SELECT 
            i.cod_inter,
            i.cod_us_1,
            i.cod_us_2,
            ip.cod_inter as ip_cod_inter,
            ip.estado_inter,
            ip.fecha_inter,
            p.desc_prod
        FROM intercambio i
        LEFT JOIN intercambio_producto ip ON i.cod_inter = ip.cod_inter
        LEFT JOIN producto p ON ip.cod_prod_origen = p.cod_prod
        ORDER BY i.cod_inter DESC
    `;

    console.log('\n--- DETAILED LIST ---');
    console.table(exchanges);

    // 4. Test the "Open" filter logic
    const openExchanges = await prisma.$queryRaw`
        SELECT 
            i.cod_inter,
            i.cod_us_1,
            i.cod_us_2,
            ip.estado_inter
        FROM intercambio i
        INNER JOIN intercambio_producto ip ON i.cod_inter = ip.cod_inter
        WHERE (i.cod_us_1 = i.cod_us_2 OR i.cod_us_2 IS NULL)
    `;
    console.log(`\n--- EXCHANGES MATCHING 'OPEN' FILTER (${(openExchanges as any[]).length}) ---`);
    console.table(openExchanges);

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
