const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAndFixTriggers() {
    console.log('='.repeat(70));
    console.log('LIMPIEZA COMPLETA Y CORRECCIÓN DE TRIGGERS');
    console.log('='.repeat(70));

    try {
        // 1. Listar todos los triggers relacionados con achievements
        console.log('\n🔍 Buscando triggers existentes...');
        const existingTriggers = await prisma.$queryRaw`
      SELECT t.tgname, c.relname as tabla, pg_get_triggerdef(t.oid) as definition
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      WHERE (t.tgname LIKE '%achievement%' OR t.tgname LIKE '%logro%')
        AND NOT t.tgisinternal
    `;

        console.log(`Encontrados: ${existingTriggers.length} triggers`);
        existingTriggers.forEach(t => {
            console.log(`  - ${t.tgname} en ${t.tabla}`);
        });

        // 2. Eliminar TODOS los triggers y funciones relacionadas
        console.log('\n🧹 Eliminando triggers y funciones...');

        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_achievement_publication ON publicacion CASCADE`);
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_check_achievement_exchange ON intercambio CASCADE`);
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS after_achievement_completed_notification ON usuario_logro CASCADE`);
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS after_update_progreso_logro ON usuario_logro CASCADE`);

        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_publication_achievement() CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_exchange_achievement() CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS check_achievement_progress() CASCADE`);

        console.log('   ✅ Limpieza completada');

        // 3. Crear función corregida para publicaciones
        console.log('\n📄 Creando trigger de publicaciones (CORREGIDO)...');

        await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_publication_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count INTEGER;
          v_progress NUMERIC;
      BEGIN
          -- Contar publicaciones ecológicas activas
          SELECT COUNT(*) INTO v_count
          FROM publicacion
          WHERE cod_us = NEW.cod_us 
            AND impacto_amb_pub > 0 
            AND estado_pub = 'activo';
          
          -- Calcular progreso
          v_progress := LEAST((v_count::NUMERIC / 25) * 100, 100);
          
          -- Insertar o actualizar con valores CORRECTOS del enum
          INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
          VALUES (
            NEW.cod_us, 
            5, 
            v_progress, 
            (CASE WHEN v_count >= 25 THEN 'completado' ELSE 'en_progreso' END)::"AchievementState"
          )
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

        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_achievement_publication
      AFTER INSERT OR UPDATE ON publicacion
      FOR EACH ROW
      WHEN (NEW.impacto_amb_pub > 0 AND NEW.estado_pub = 'activo')
      EXECUTE FUNCTION update_publication_achievement()
    `);

        console.log('   ✅ Trigger de publicaciones creado');

        // 4. Verificar
        console.log('\n🔍 Verificando instalación...');
        const newTriggers = await prisma.$queryRaw`
      SELECT t.tgname, c.relname as tabla
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      WHERE t.tgname = 'trg_achievement_publication'
        AND NOT t.tgisinternal
    `;

        console.log('\n' + '='.repeat(70));
        if (newTriggers.length > 0) {
            console.log('✅ TRIGGER INSTALADO CORRECTAMENTE');
            console.log('='.repeat(70));
            console.log(`\n✓ ${newTriggers[0].tgname} → ${newTriggers[0].tabla}`);
            console.log('\n💡 Valores del enum usados:');
            console.log('   - "en_progreso" (con guión bajo, minúsculas)');
            console.log('   - "completado" (minúsculas)');
            console.log('\n🎯 Ahora puedes publicar productos sin errores');
        } else {
            console.log('⚠️  NO SE PUDO INSTALAR EL TRIGGER');
        }
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanAndFixTriggers();
