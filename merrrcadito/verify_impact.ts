import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
    try {
        console.log("=== Verificando Publicaciones con Impacto Ambiental ===\n");

        // Check recent publications
        const pubs: any[] = await prisma.$queryRaw`
            SELECT 
                p.cod_pub,
                pr.nom_prod,
                p.impacto_amb_pub,
                pr.desc_prod,
                p.contenido
            FROM publicacion p
            JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
            JOIN producto pr ON pp.cod_prod = pr.cod_prod
            WHERE p.estado_pub = 'activo'
            ORDER BY p.cod_pub DESC
            LIMIT 10
        `;

        console.log("Últimas 10 publicaciones:");
        console.log("========================================");

        pubs.forEach(pub => {
            const desc = pub.desc_prod || pub.contenido || '(sin descripción)';
            console.log(`\n📦 ${pub.nom_prod} (ID: ${pub.cod_pub})`);
            console.log(`   🍃 Impacto: ${pub.impacto_amb_pub} pts CO2`);
            console.log(`   📝 Descripción: ${desc.substring(0, 50)}${desc.length > 50 ? '...' : ''}`);
        });

        console.log("\n========================================");
        const withImpact = pubs.filter(p => p.impacto_amb_pub > 0).length;
        console.log(`\n✅ Publicaciones con impacto > 0: ${withImpact}/${pubs.length}`);
        console.log(`❌ Publicaciones con impacto = 0: ${pubs.length - withImpact}/${pubs.length}`);

        if (withImpact === 0) {
            console.log("\n⚠️  PROBLEMA: Ninguna publicación tiene impacto calculado");
            console.log("   Verifica que los productos tengan material vinculado en material_producto");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
})();
