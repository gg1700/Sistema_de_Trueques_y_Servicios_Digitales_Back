const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTriggersWithCorrectType() {
    console.log('='.repeat(70));
    console.log('CREANDO TRIGGERS - TIPO CORRECTO');
    console.log('='.repeat(70));

    try {
        console.log('\n🧹 Limpieza...');
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_achievement_publication ON publicacion CASCADE`);
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_check_achievement_exchange ON intercambio CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_publication_achievement() CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_exchange_achievement() CASCADE`);

        // PUBLICACIONES
        console.log('\n📄 1/2 Publicaciones...');
        await prisma.$executeRawUnsafe(`
      CREATE FUNCTION update_publication_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count INTEGER;
          v_progress NUMERIC;
          v_estado "AchievementState";
      BEGIN
          SELECT COUNT(*) INTO v_count
          FROM publicacion
          WHERE cod_us = NEW.cod_us AND impacto_amb_pub > 0 AND estado_pub = 'activo';
          
          v_progress := LEAST((v_count::NUMERIC / 25) * 100, 100);
          v_estado := CASE WHEN v_count >= 25 THEN 'completado' ELSE 'en_progreso' END;
          
          INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
          VALUES (NEW.cod_us, 5, v_progress, v_estado)
          ON CONFLICT (cod_us, cod_logro) DO UPDATE
          SET progreso = v_progress, estado_logro = v_estado;
          
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
        console.log('   ✅ OK');

        // INTERCAMBIOS
        console.log('\n📄 2/2 Intercambios...');
        await prisma.$executeRawUnsafe(`
      CREATE FUNCTION update_exchange_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count INTEGER;
          v_progress NUMERIC;
          v_estado "AchievementState";
      BEGIN
          IF NEW.estado_inter = 'completado' THEN
              
              -- Usuario 1
              SELECT COUNT(*) INTO v_count
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_1 OR cod_us_2 = NEW.cod_us_1) AND estado_inter = 'completado';
              
              v_progress := LEAST((v_count::NUMERIC / 1) * 100, 100);
              v_estado := CASE WHEN v_count >= 1 THEN 'completado' ELSE 'en_progreso' END;
              
              INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
              VALUES (NEW.cod_us_1, 1, v_progress, v_estado)
              ON CONFLICT (cod_us, cod_logro) DO UPDATE
              SET progreso = v_progress, estado_logro = v_estado;
              
              -- Usuario 2
              SELECT COUNT(*) INTO v_count
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_2 OR cod_us_2 = NEW.cod_us_2) AND estado_inter = 'completado';
              
              v_progress := LEAST((v_count::NUMERIC / 1) * 100, 100);
              v_estado := CASE WHEN v_count >= 1 THEN 'completado' ELSE 'en_progreso' END;
              
              INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
              VALUES (NEW.cod_us_2, 1, v_progress, v_estado)
              ON CONFLICT (cod_us, cod_logro) DO UPDATE
              SET progreso = v_progress, estado_logro = v_estado;
              
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_check_achievement_exchange
      AFTER UPDATE ON intercambio
      FOR EACH ROW
      WHEN (OLD.estado_inter IS DISTINCT FROM NEW.estado_inter AND NEW.estado_inter = 'completado')
      EXECUTE FUNCTION update_exchange_achievement()
    `);
        console.log('   ✅ OK');

        const triggers = await prisma.$queryRaw`
      SELECT tgname, tgrelid::regclass::text as tabla
      FROM pg_trigger
      WHERE (tgname LIKE '%achievement%') AND NOT tgisinternal
    `;

        console.log('\n' + '='.repeat(70));
        console.log(`✅ COMPLETADO - ${triggers.length}/2 triggers`);
        console.log('='.repeat(70));
        triggers.forEach(t => console.log(`  ✓ ${t.tgname} → ${t.tabla}`));
        console.log('\n🎯 Prueba publicando un producto o completando un intercambio');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createTriggersWithCorrectType();
