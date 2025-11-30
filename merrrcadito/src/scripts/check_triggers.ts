import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTriggers() {
    try {
        console.log('\n=== VERIFICANDO TRIGGERS EN LA BASE DE DATOS ===\n');

        // Check if triggers exist
        const triggers = await prisma.$queryRaw`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_timing,
        action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'transaccion'
      ORDER BY action_timing, event_manipulation, trigger_name
    ` as any[];

        if (triggers.length === 0) {
            console.log('❌ NO SE ENCONTRARON TRIGGERS PARA LA TABLA transaccion\n');
        } else {
            console.log(`✓ Se encontraron ${triggers.length} triggers:\n`);
            triggers.forEach((t, i) => {
                console.log(`${i + 1}. ${t.trigger_name}`);
                console.log(`   Timing: ${t.action_timing} ${t.event_manipulation}`);
                console.log(`   Function: ${t.action_statement}`);
                console.log('');
            });
        }

        // Check the trigger function
        console.log('\n=== VERIFICANDO FUNCIÓN DEL TRIGGER ===\n');

        const triggerFunction = await prisma.$queryRaw`
      SELECT pg_get_functiondef(oid) as definition
      FROM pg_proc
      WHERE proname = 'trg_after_trans_aplicar_saldos'
    ` as any[];

        if (triggerFunction.length > 0) {
            console.log('✓ Función trg_after_trans_aplicar_saldos encontrada\n');
            console.log(triggerFunction[0].definition);
        } else {
            console.log('❌ Función trg_after_trans_aplicar_saldos NO encontrada\n');
        }

    } catch (error) {
        console.error('❌ ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTriggers();
