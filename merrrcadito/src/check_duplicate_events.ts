import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Verificando eventos duplicados para usuario...");

        // Probar el stored procedure directamente
        const testUserId = 1; // Cambia esto según sea necesario
        const result = await prisma.$queryRaw`
      SELECT * FROM sp_obtenerEventosPropiosUsuario(${testUserId})
    `;

        console.log("Eventos encontrados:", result);
        console.log("Total de eventos:", (result as any[]).length);

        // Verificar duplicados por cod_evento
        const eventIds = (result as any[]).map(e => e.cod_evento);
        const uniqueIds = new Set(eventIds);

        console.log("IDs de eventos:", eventIds);
        console.log("IDs únicos:", Array.from(uniqueIds));

        if (eventIds.length !== uniqueIds.size) {
            console.error("⚠️  DUPLICADOS ENCONTRADOS!");
            console.log("Total eventos:", eventIds.length);
            console.log("Eventos únicos:", uniqueIds.size);

            // Mostrar cuáles están duplicados
            const duplicates = eventIds.filter((id, index) => eventIds.indexOf(id) !== index);
            console.log("Eventos duplicados:", duplicates);
        } else {
            console.log("✅ No hay duplicados en la consulta");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
