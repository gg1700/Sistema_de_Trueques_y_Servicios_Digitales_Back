import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Creando enum ExchangeState...');

        // 1. Crear el enum ExchangeState
        await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ExchangeState" AS ENUM ('pendiente', 'satisfactorio', 'no_satisfactorio');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
        console.log('✓ Enum ExchangeState creado');

        // 2. Agregar el campo estado_inter a la tabla intercambio
        await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE intercambio 
        ADD COLUMN estado_inter "ExchangeState" DEFAULT 'pendiente';
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `);
        console.log('✓ Campo estado_inter agregado a tabla intercambio');

        console.log('✅ Cambios de esquema completados exitosamente');
    } catch (error) {
        console.error('❌ Error en cambios de esquema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
