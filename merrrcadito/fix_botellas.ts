import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
    try {
        console.log("=== Fixing 'Botellas Amigables' ===");

        // Product ID 104
        const cod_prod = 104;

        // Find plastic material (likely HDPE or PP for bottles)
        const plasticMat: any[] = await prisma.$queryRaw`
            SELECT * FROM material 
            WHERE nom_mat ILIKE '%plástico%' OR nom_mat ILIKE '%HDPE%'
            ORDER BY cod_mat
            LIMIT 1
        `;

        if (plasticMat.length === 0) {
            console.log("No plastic material found, using first available");
            const anyMat: any[] = await prisma.$queryRaw`SELECT * FROM material LIMIT 1`;
            var cod_mat = anyMat[0].cod_mat;
            var factor = anyMat[0].factor_co2;
        } else {
            var cod_mat = plasticMat[0].cod_mat;
            var factor = plasticMat[0].factor_co2;
        }

        console.log(`Using material: ${cod_mat} with factor: ${factor}`);

        // Link material to product
        await prisma.$executeRaw`
            INSERT INTO material_producto (cod_mat, cod_prod)
            VALUES (${cod_mat}::INTEGER, ${cod_prod}::INTEGER)
            ON CONFLICT (cod_mat, cod_prod) DO NOTHING
        `;

        // Get publication data
        const pubData: any[] = await prisma.$queryRaw`
            SELECT p.cod_pub, pr.peso_prod, pp.cant_prod
            FROM publicacion p
            JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
            JOIN producto pr ON pp.cod_prod = pr.cod_prod
            WHERE pr.cod_prod = ${cod_prod}::INTEGER
            ORDER BY p.cod_pub DESC
            LIMIT 1
        `;

        if (pubData.length > 0) {
            const { cod_pub, peso_prod, cant_prod } = pubData[0];
            const impacto = peso_prod * cant_prod * factor;

            console.log(`Calculated impact: ${peso_prod} × ${cant_prod} × ${factor} = ${impacto}`);

            await prisma.$executeRaw`
                UPDATE publicacion
                SET impacto_amb_pub = ${impacto}::DECIMAL
                WHERE cod_pub = ${cod_pub}::INTEGER
            `;

            console.log(`✅ Fixed! Publication ${cod_pub} now has impact: ${impacto}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
})();
