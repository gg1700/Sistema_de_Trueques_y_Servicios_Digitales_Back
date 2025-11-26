import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Reseteando intercambios existentes a estado "abierto" (origen nulo)...');

        // 1. Resetear cod_us_1 a NULL en la tabla intercambio
        await prisma.$executeRawUnsafe(`
      UPDATE intercambio 
      SET cod_us_1 = NULL, 
          cant_prod_origen = 0, 
          unidad_medida_origen = NULL,
          estado_inter = 'pendiente'::"ExchangeState"
    `);
        console.log('✓ Tabla intercambio actualizada');

        // 2. Resetear cod_prod_origen a NULL en la tabla intercambio_producto
        await prisma.$executeRawUnsafe(`
      UPDATE intercambio_producto 
      SET cod_prod_origen = NULL
    `);
        console.log('✓ Tabla intercambio_producto actualizada');

        console.log('✅ Todos los intercambios reseteados exitosamente');
    } catch (error) {
        console.error('❌ Error reseteando intercambios:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
