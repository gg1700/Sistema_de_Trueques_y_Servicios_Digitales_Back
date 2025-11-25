import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Verificando stored procedure sp_obtenerpublicacionesproducto...\n");

        // Ver la definición actual
        const spDef = await prisma.$queryRaw`
      SELECT pg_get_functiondef('sp_obtenerpublicacionesproducto'::regproc) as definition;
    `;

        console.log("Definición actual:");
        console.log(spDef);

        // Intentar ejecutar el SP
        console.log("\n\nIntentando ejecutar el SP...");
        try {
            const result = await prisma.$queryRaw`
        SELECT * FROM sp_obtenerpublicacionesproducto() LIMIT 1;
      `;
            console.log("✅ SP ejecutado correctamente");
            console.log("Resultado:");
            console.log(result);
        } catch (execError) {
            console.log("❌ Error al ejecutar SP:");
            console.error(execError);
        }

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
