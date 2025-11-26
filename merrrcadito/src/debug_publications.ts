import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Verificando publicaciones para usuario cod_us=7...\n");

        // Consultar directamente la tabla publicacion
        const directQuery = await prisma.$queryRaw`
      SELECT 
        p.cod_pub,
        p.cod_us,
        p.estado_pub,
        p.contenido,
        pr.nom_prod,
        pr.desc_prod
      FROM publicacion p
      LEFT JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
      LEFT JOIN producto pr ON pp.cod_prod = pr.cod_prod
      WHERE p.cod_us = 7
      ORDER BY p.cod_pub;
    `;

        console.log("Consulta directa a tabla PUBLICACION:");
        console.log(directQuery);
        console.log(`\nTotal: ${(directQuery as any[]).length} registros\n`);

        // Consultar usando el stored procedure
        const spQuery = await prisma.$queryRaw`
      SELECT * FROM sp_obtenerpublicacionesproducto()
      WHERE cod_us = 7;
    `;

        console.log("Resultado del stored procedure sp_obtenerpublicacionesproducto:");
        console.log(spQuery);
        console.log(`\nTotal: ${(spQuery as any[]).length} registros\n`);

        // Comparar
        const directIds = (directQuery as any[]).map((r: any) => r.cod_pub).sort();
        const spIds = (spQuery as any[]).map((r: any) => r.cod_pub).sort();

        console.log("IDs de consulta directa:", directIds);
        console.log("IDs del stored procedure:", spIds);

        const missing = directIds.filter((id: number) => !spIds.includes(id));
        if (missing.length > 0) {
            console.log("\n⚠️  PUBLICACIONES FALTANTES EN SP:", missing);
        } else {
            console.log("\n✅ Ambas consultas devuelven las mismas publicaciones");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
