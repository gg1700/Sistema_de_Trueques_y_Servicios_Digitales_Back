const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyTriggers() {
    console.log('='.repeat(70));
    console.log('APLICANDO TRIGGERS DE LOGROS');
    console.log('='.repeat(70));

    const triggers = [
        {
            name: 'Trigger de Intercambios',
            file: 'trigger_intercambios.sql',
            logro: '#1 Primer Intercambio'
        },
        {
            name: 'Trigger de Publicaciones',
            file: 'trigger_publicaciones.sql',
            logro: '#5 Emprendedor Verde'
        }
    ];

    let success = 0;
    let errors = 0;

    for (const trigger of triggers) {
        console.log(`\n📄 Aplicando: ${trigger.name}`);
        console.log(`   Logro: ${trigger.logro}`);

        try {
            const filePath = path.join(__dirname, '../db/migrations', trigger.file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            // Dividir por comandos (separados por líneas vacías o comentarios DO $$)
            const commands = sql
                .split(/(?=CREATE OR REPLACE FUNCTION)|(?=DROP TRIGGER)|(?=CREATE TRIGGER)|(?=DO \$\$)/)
                .map(cmd => cmd.trim())
                .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

            console.log(`   📝 Ejecutando ${commands.length} comandos...`);

            for (const cmd of commands) {
                try {
                    await prisma.$executeRawUnsafe(cmd);
                } catch (e) {
                    // Ignorar errores de "ya existe" o "no existe"
                    if (!e.message.includes('already exists') &&
                        !e.message.includes('does not exist')) {
                        throw e;
                    }
                }
            }

            console.log(`   ✅ Aplicado exitosamente`);
            success++;

        } catch (error) {
            console.log(`   ❌ Error: ${error.message.split('\n')[0]}`);
            errors++;
        }
    }

    // Verificar triggers instalados
    console.log('\n' + '='.repeat(70));
    console.log('VERIFICANDO TRIGGERS INSTALADOS');
    console.log('='.repeat(70));

    const installedTriggers = await prisma.$queryRaw`
    SELECT 
      t.tgname as trigger_name,
      c.relname as table_name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE (t.tgname LIKE '%achievement%' OR t.tgname LIKE '%logro%')
      AND NOT t.tgisinternal
    ORDER BY c.relname, t.tgname
  `;

    console.log(`\nTriggers activos: ${installedTriggers.length}`);
    installedTriggers.forEach(trg => {
        console.log(`  ✓ ${trg.trigger_name} en tabla ${trg.table_name}`);
    });

    // Resumen
    console.log('\n' + '='.repeat(70));
    console.log('RESUMEN');
    console.log('='.repeat(70));
    console.log(`✅ Triggers aplicados: ${success}/${triggers.length}`);
    if (errors > 0) {
        console.log(`⚠️  Errores: ${errors}`);
    }

    console.log('\n📋 Logros que se actualizan automáticamente:');
    console.log('  ✓ #1 Primer Intercambio (al completar intercambio)');
    console.log('  ✓ #5 Emprendedor Verde (al publicar producto/servicio ecológico)');
    console.log('\n🎯 Prueba ahora:');
    console.log('  1. Publica un producto con impacto ambiental > 0');
    console.log('  2. Completa un intercambio');
    console.log('  3. Ve a /logros y verás el progreso actualizado');
    console.log('='.repeat(70));

    await prisma.$disconnect();
}

applyTriggers().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
