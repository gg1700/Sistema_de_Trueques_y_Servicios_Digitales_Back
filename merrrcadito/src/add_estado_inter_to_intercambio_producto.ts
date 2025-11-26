import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Verificando si la columna estado_inter existe en intercambio_producto...');

        // Verificar si la columna ya existe
        const checkColumn: any[] = await prisma.$queryRaw`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'intercambio_producto' 
            AND column_name = 'estado_inter';
        `;

        if (checkColumn.length > 0) {
            console.log('✅ La columna estado_inter ya existe en intercambio_producto');
            return;
        }

        console.log('Agregando columna estado_inter a intercambio_producto...');

        // Agregar la columna estado_inter con valor por defecto NULL
        await prisma.$executeRawUnsafe(`
            ALTER TABLE intercambio_producto 
            ADD COLUMN estado_inter "TransactionState" DEFAULT NULL;
        `);

        console.log('✅ Columna estado_inter agregada exitosamente a intercambio_producto');

        // Verificar que se agregó correctamente
        const verify: any[] = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'intercambio_producto';
        `;

        console.log('\nColumnas actuales en intercambio_producto:');
        console.log(verify);

    } catch (error) {
        console.error('❌ Error al agregar columna:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
