import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Consultando valores válidos para el enum EventType...");
        const result = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"EventType")) AS valor_enum;
    `;
        console.log("Valores válidos:", result);
    } catch (e) {
        console.error("Error al consultar enum:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
