const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEnumType() {
    try {
        // Ver el nombre exacto del tipo enum
        const enumInfo = await prisma.$queryRaw`
      SELECT 
        t.typname as enum_name,
        e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname LIKE '%chievement%' OR t.typname LIKE '%ogro%'
      ORDER BY t.typname, e.enumsortorder
    `;

        console.log('Información del enum:');
        console.log(JSON.stringify(enumInfo, null, 2));

        // Ver la definición de la tabla usuario_logro
        const tableInfo = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns
      WHERE table_name = 'usuario_logro'
        AND column_name = 'estado_logro'
    `;

        console.log('\nColumna estado_logro:');
        console.log(JSON.stringify(tableInfo, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkEnumType();
