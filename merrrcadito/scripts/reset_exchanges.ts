import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Iniciando reseteo de datos de origen en intercambios...');

        // 1. Resetear intercambio_producto
        // Setear cod_prod_origen a NULL
        const updateIntercambioProducto = await prisma.$executeRaw`
      UPDATE "intercambio_producto"
      SET "cod_prod_origen" = NULL,
          "estado_inter" = NULL
    `;
        console.log(`Actualizados ${updateIntercambioProducto} registros en intercambio_producto.`);

        // 2. Resetear intercambio
        // Setear cod_us_1 a NULL, unidad_medida_origen a NULL
        // cant_prod_origen es NOT NULL, así que lo seteamos a 0
        // estado_inter a 'pendiente'
        const updateIntercambio = await prisma.$executeRaw`
      UPDATE "intercambio"
      SET "cod_us_1" = NULL,
          "cant_prod_origen" = 0,
          "unidad_medida_origen" = NULL,
          "estado_inter" = 'pendiente'::"ExchangeState"
    `;
        console.log(`Actualizados ${updateIntercambio} registros en intercambio.`);

        console.log('✅ Reseteo completado exitosamente.');
    } catch (error) {
        console.error('❌ Error durante el reseteo:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
