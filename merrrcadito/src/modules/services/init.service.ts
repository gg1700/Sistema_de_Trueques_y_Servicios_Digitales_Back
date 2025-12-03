import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * URGENTLY check if transaction triggers are still active
 */
export async function checkTriggerStatus() {
  try {
    const triggers = await prisma.$queryRaw`
      SELECT tgname, tgenabled 
      FROM pg_trigger 
      WHERE tgrelid = 'transaccion'::regclass 
        AND tgname LIKE '%trans%'
      ORDER BY tgname;
    `;

    console.log('[DEBUG] Active triggers on transaccion table:', JSON.stringify(triggers, null, 2));
    return triggers;
  } catch (error) {
    console.error('[DEBUG] Error checking triggers:', error);
    return [];
  }
}

/**
 * Force disable triggers using Prisma (should work even if direct psql fails)
 */
export async function forceDisableTriggers() {
  try {
    console.log('[CRITICAL] FORCE DISABLING TRANSACTION TRIGGERS...');

    // Drop triggers one by one
    const triggers = [
      'after_insert_transaccion_aplicar_saldos',
      'before_insert_transaccion_validar_saldo',
      'before_insert_transaccion_verificar_modalidad'
    ];

    for (const triggerName of triggers) {
      try {
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS ${triggerName} ON transaccion CASCADE;`);
        console.log(`  ✓ Dropped trigger: ${triggerName}`);
      } catch (err) {
        console.error(`  ✗ Failed to drop ${triggerName}:`, err);
      }
    }

    console.log('[CRITICAL] ✓ All triggers force-disabled');

    // Verify they're gone
    const remaining = await checkTriggerStatus();
    if (remaining && (remaining as any[]).length > 0) {
      console.error('[CRITICAL] ⚠ WARNING: Some triggers are STILL ACTIVE:', remaining);
    } else {
      console.log('[CRITICAL] ✓ Confirmed: No transaction triggers remaining');
    }

  } catch (error) {
    console.error('[CRITICAL] Error force-disabling triggers:', error);
    throw error;
  }
}
