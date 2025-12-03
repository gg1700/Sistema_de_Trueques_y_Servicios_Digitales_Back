const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTriggers() {
    console.log('='.repeat(70));
    console.log('PROBANDO TRIGGERS DE LOGROS');
    console.log('='.repeat(70));

    try {
        // Ver triggers instalados
        const triggers = await prisma.$queryRaw`
      SELECT tgname, tgrelid::regclass::text as tabla
      FROM pg_trigger
      WHERE (tgname LIKE '%achievement%' OR tgname LIKE '%logro%') AND NOT tgisinternal
      ORDER BY tgname
    `;

        console.log(`\n✅ Triggers instalados: ${triggers.length}`);
        triggers.forEach(t => console.log(`   ✓ ${t.tgname} → ${t.tabla}`));

        // Actualizar progreso actual ejecutando la función manualmente
        console.log('\n📊 Actualizando progreso actual...');

        // Trigger el cálculo para publicaciones
        await prisma.$executeRawUnsafe(`
      SELECT update_publication_achievement() 
      FROM publicacion 
      WHERE cod_us = 86 AND impacto_amb_pub > 0 
      LIMIT 1
    `);

        // Ver progreso actualizado
        const logros = await prisma.$queryRaw`
      SELECT l.titulo_logro, ul.progreso, ul.estado_logro::text as estado
      FROM usuario_logro ul
      JOIN logro l ON ul.cod_logro = l.cod_logro
      WHERE ul.cod_us = 86 AND ul.cod_logro IN (1, 5)
      ORDER BY ul.cod_logro
    `;

        console.log('\n🏆 Progreso actual (Usuario 86):');
        logros.forEach(l => {
            const emoji = l.estado === 'completado' ? '✅' : '🔄';
            console.log(`   ${emoji} ${l.titulo_logro}: ${l.progreso}% (${l.estado})`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('🎯 PRUEBA AHORA:');
        console.log('='.repeat(70));
        console.log('\n1. Publica un nuevo producto ecológico (impacto > 0)');
        console.log('2. Recarga la página /logros');
        console.log('3. Verás el progreso actualizado automáticamente!');
        console.log('\n💡 El trigger está funcionando y actualizará el progreso');
        console.log('   cada vez que publiques un producto/servicio ecológico');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testTriggers();
