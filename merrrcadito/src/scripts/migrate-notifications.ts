import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
    try {
        console.log('Creating notification table...');

        // Crear tabla de notificaciones
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS notificacion (
                cod_notif SERIAL PRIMARY KEY,
                cod_us INT NOT NULL REFERENCES usuario(cod_us) ON DELETE CASCADE,
                tipo_notif VARCHAR(50) NOT NULL,
                cod_ref INT,
                mensaje TEXT NOT NULL,
                leida BOOLEAN DEFAULT FALSE,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Creating indexes...');

        // Crear índices
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_notificacion_usuario ON notificacion(cod_us);
        `);

        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_notificacion_leida ON notificacion(leida);
        `);

        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS idx_notificacion_fecha ON notificacion(fecha_creacion DESC);
        `);

        console.log('Adding confirmation columns to intercambio table...');

        // Agregar columnas de confirmación
        await prisma.$executeRawUnsafe(`
            ALTER TABLE intercambio 
            ADD COLUMN IF NOT EXISTS confirmado_us_1 BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS confirmado_us_2 BOOLEAN DEFAULT FALSE;
        `);

        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

runMigration();
