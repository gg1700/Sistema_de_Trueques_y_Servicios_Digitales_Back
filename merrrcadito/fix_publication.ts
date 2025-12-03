import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
    try {
        // 1. Find the product and publication
        const data: any[] = await prisma.$queryRaw`
            SELECT p.cod_pub, pr.cod_prod, pr.peso_prod, pp.cant_prod
            FROM publicacion p
            JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
            JOIN producto pr ON pp.cod_prod = pr.cod_prod
            WHERE pr.nom_prod ILIKE '%Carton Reciclable%'
            ORDER BY p.cod_pub DESC
            LIMIT 1
        `;

        if (data.length > 0) {
            const { cod_pub, cod_prod, peso_prod, cant_prod } = data[0];
            console.log(`Found publication: ${cod_pub}, product: ${cod_prod}`);

            // 2. Link to Material (Papel = 5)
            // Check if material exists first
            const mat = await prisma.$queryRaw`SELECT * FROM material WHERE nom_mat ILIKE '%Papel%' LIMIT 1`;
            const cod_mat = (mat as any[])[0]?.cod_mat || 5;
            const factor = (mat as any[])[0]?.factor_co2 || 1.32;

            console.log(`Linking to material: ${cod_mat} (Factor: ${factor})`);

            await prisma.$executeRaw`
                INSERT INTO material_producto (cod_mat, cod_prod)
                VALUES (${cod_mat}::INTEGER, ${cod_prod}::INTEGER)
                ON CONFLICT (cod_mat, cod_prod) DO NOTHING
            `;

            // 3. Recalculate Impact
            const impacto = peso_prod * cant_prod * factor;
            console.log(`Calculated Impact: ${impacto}`);

            // 4. Update Publication
            await prisma.$executeRaw`
                UPDATE publicacion
                SET impacto_amb_pub = ${impacto}::DECIMAL
                WHERE cod_pub = ${cod_pub}::INTEGER
            `;

            console.log("✅ Fixed successfully!");
        } else {
            console.log("❌ Publication not found");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
})();
