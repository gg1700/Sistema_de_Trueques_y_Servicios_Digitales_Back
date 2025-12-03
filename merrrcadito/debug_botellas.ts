import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
    try {
        console.log("=== Checking 'Botellas Amigables' publication ===");

        // Find the product and publication
        const data: any[] = await prisma.$queryRaw`
            SELECT 
                p.cod_pub,
                p.impacto_amb_pub,
                pr.cod_prod,
                pr.nom_prod,
                pr.peso_prod,
                pp.cant_prod,
                mp.cod_mat,
                m.nom_mat,
                m.factor_co2
            FROM publicacion p
            JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
            JOIN producto pr ON pp.cod_prod = pr.cod_prod
            LEFT JOIN material_producto mp ON pr.cod_prod = mp.cod_prod
            LEFT JOIN material m ON mp.cod_mat = m.cod_mat
            WHERE pr.nom_prod ILIKE '%Botellas Amigables%'
            ORDER BY p.cod_pub DESC
            LIMIT 1
        `;

        if (data.length > 0) {
            console.log("Found publication:", data[0]);

            const { cod_pub, cod_prod, peso_prod, cant_prod, cod_mat, factor_co2 } = data[0];

            if (!cod_mat) {
                console.log("❌ NO MATERIAL LINKED - This is why impact is 0");
                console.log("Product ID:", cod_prod);
                console.log("Need to check why material wasn't linked during product creation");
            } else {
                console.log("✅ Material is linked:", cod_mat);
                const expectedImpact = peso_prod * cant_prod * factor_co2;
                console.log(`Expected impact: ${peso_prod} × ${cant_prod} × ${factor_co2} = ${expectedImpact}`);
            }
        } else {
            console.log("❌ Publication not found");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
})();
