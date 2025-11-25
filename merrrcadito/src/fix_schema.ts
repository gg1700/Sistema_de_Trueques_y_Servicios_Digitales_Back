import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Alterando tabla EVENTO para permitir cod_org NULL...");
        await prisma.$executeRaw`ALTER TABLE EVENTO ALTER COLUMN cod_org DROP NOT NULL;`;
        console.log("Tabla EVENTO modificada exitosamente.");
    } catch (e) {
        console.error("Error al modificar la tabla:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
