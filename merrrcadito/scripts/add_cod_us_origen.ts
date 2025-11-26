import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Iniciando migración: Agregar cod_us_origen a intercambio_producto...');

        // 1. Agregar columna cod_us_origen
        await prisma.$executeRaw`
      ALTER TABLE "intercambio_producto"
      ADD COLUMN IF NOT EXISTS "cod_us_origen" INTEGER;
    `;
        console.log('✅ Columna cod_us_origen agregada.');

        // 2. Agregar constraint de Foreign Key
        // Primero verificamos si ya existe para no duplicar error
        try {
            await prisma.$executeRaw`
            ALTER TABLE "intercambio_producto"
            ADD CONSTRAINT "intercambio_producto_cod_us_origen_fkey"
            FOREIGN KEY ("cod_us_origen") REFERENCES "usuario"("cod_us");
        `;
            console.log('✅ Foreign Key constraint agregada.');
        } catch (e: any) {
            if (e.message.includes('already exists')) {
                console.log('ℹ️ Constraint ya existe, saltando.');
            } else {
                throw e;
            }
        }

        console.log('✅ Migración completada exitosamente.');
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
