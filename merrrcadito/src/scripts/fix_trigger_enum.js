const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTrigger() {
    console.log('='.repeat(70));
    console.log('ARREGLANDO TRIGGER DE PUBLICACIONES');
    console.log('='.repeat(70));

    try {
        console.log('\n🔧 Eliminando trigger anterior...');
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_achievement_publication ON publicacion CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_publication_achievement() CASCADE`);

        console.log('\n📄 Creando trigger corregido...');

        // Función corregida con valores correctos del enum
        await prisma.$executeRawUnsafe(`
      CREATE FUNCTION update_publication_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count INTEGER;
          v_progress NUMERIC;
      BEGIN
          SELECT COUNT(*) INTO v_count
          FROM publicacion
          WHERE cod_us = NEW.cod_us AND impacto_amb_pub > 0 AND estado_pub = 'activo';
          
          v_progress := LEAST((v_count::NUMERIC / 25) * 100, 100);
          
          INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
          VALUES (NEW.cod_us, 5, v_progress, 
                  (CASE WHEN v_count >= 25 THEN 'completado' ELSE 'en_progreso' END)::"AchievementState")
          ON CONFLICT (cod_us, cod_logro) DO UPDATE
          SET progreso = v_progress,
              estado_logro = (CASE WHEN v_count >= 25 THEN 'completado' ELSE 'en_progreso' END)::"AchievementState",
              fecha_obtencion_logro = CASE 
                  WHEN v_count >= 25 AND usuario_logro.estado_logro::text != 'completado' 
                  THEN NOW() 
                  ELSE usuario_logro.fecha_obtencion_logro 
              END;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

        // Trigger
        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_achievement_publication
      AFTER INSERT OR UPDATE ON publicacion
      FOR EACH ROW
      WHEN (NEW.impacto_amb_pub > 0 AND NEW.estado_pub = 'activo')
      EXECUTE FUNCTION update_publication_achievement()
    `);

        console.log('   ✅ Trigger corregido y aplicado');

        // Verificar
        const triggers = await prisma.$queryRaw`
      SELECT tgname FROM pg_trigger 
      WHERE tgname = 'trg_achievement_publication' AND NOT tgisinternal
    `;

        console.log('\n' + '='.repeat(70));
        console.log(`✅ TRIGGER CORREGIDO - ${triggers.length} trigger instalado`);
        console.log('='.repeat(70));
        console.log('\n💡 Ahora puedes publicar productos sin errores');
        console.log('🎯 El progreso se actualizará automáticamente');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixTrigger();
