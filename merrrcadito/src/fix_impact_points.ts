import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Verificando impacto_amb_pub en publicaciones...\n");

        // Ver valores actuales
        const pubs = await prisma.$queryRaw`
      SELECT cod_pub, impacto_amb_pub, estado_pub 
      FROM publicacion 
      WHERE estado_pub = 'activo'
      ORDER BY cod_pub
      LIMIT 10;
    `;

        console.log("Valores de impacto_amb_pub en tabla publicacion:");
        console.log(pubs);

        // Ver qué devuelve el SP
        const spResult = await prisma.$queryRaw`
      SELECT cod_pub, nom_prod, impacto_amb_pub 
      FROM sp_obtenerpublicacionesproducto()
      LIMIT 5;
    `;

        console.log("\n\nLo que devuelve el SP:");
        console.log(spResult);

        // Actualizar valores si están en 0
        console.log("\n\nActualizando impacto_amb_pub para publicaciones activas...");
        const updated = await prisma.$executeRaw`
      UPDATE publicacion 
      SET impacto_amb_pub = 5.0
      WHERE estado_pub = 'activo' AND (impacto_amb_pub = 0 OR impacto_amb_pub IS NULL);
    `;

        console.log(`✅ Actualizadas ${updated} publicaciones con impacto_amb_pub = 5.0`);

        // Verificar de nuevo
        const afterUpdate = await prisma.$queryRaw`
      SELECT cod_pub, impacto_amb_pub FROM sp_obtenerpublicacionesproducto() LIMIT 5;
    `;

        console.log("\n\nDespués de actualizar:");
        console.log(afterUpdate);

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
