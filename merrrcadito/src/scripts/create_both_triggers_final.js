const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBothTriggersFinal() {
    console.log('='.repeat(70));
    console.log('CREANDO TRIGGERS FINALES - SIN COMILLAS EN TIPO');
    console.log('='.repeat(70));

    try {
        // Limpiar todo
        console.log('\n🧹 Limpieza completa...');
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_achievement_publication ON publicacion CASCADE`);
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_check_achievement_exchange ON intercambio CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_publication_achievement() CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_exchange_achievement() CASCADE`);
        console.log('   ✅ Limpieza completada');

        // ========================================
        // 1. TRIGGER DE PUBLICACIONES
        // ========================================
        console.log('\n📄 1/2 Creando trigger de publicaciones...');

        await prisma.$executeRawUnsafe(`
      CREATE FUNCTION update_publication_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count INTEGER;
          v_progress NUMERIC;
          v_estado AchievementState;
      BEGIN
          SELECT COUNT(*) INTO v_count
          FROM publicacion
          WHERE cod_us = NEW.cod_us AND impacto_amb_pub > 0 AND estado_pub = 'activo';
          
          v_progress := LEAST((v_count::NUMERIC / 25) * 100, 100);
          v_estado := CASE WHEN v_count >= 25 THEN 'completado' ELSE 'en_progreso' END;
          
          INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
          VALUES (NEW.cod_us, 5, v_progress, v_estado)
          ON CONFLICT (cod_us, cod_logro) DO UPDATE
          SET progreso = v_progress,
              estado_logro = v_estado,
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

        console.log('   ✅ Publicaciones OK');

        // ========================================
        // 2. TRIGGER DE INTERCAMBIOS
        // ========================================
        console.log('\n📄 2/2 Creando trigger de intercambios...');

        await prisma.$executeRawUnsafe(`
      CREATE FUNCTION update_exchange_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count INTEGER;
          v_progress NUMERIC;
          v_estado AchievementState;
      BEGIN
          IF NEW.estado_inter = 'completado' THEN
              
              -- Usuario 1
              SELECT COUNT(*) INTO v_count
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_1 OR cod_us_2 = NEW.cod_us_1)
                AND estado_inter = 'completado';
              
              v_progress := LEAST((v_count::NUMERIC / 1) * 100, 100);
              v_estado := CASE WHEN v_count >= 1 THEN 'completado' ELSE 'en_progreso' END;
              
              INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
              VALUES (NEW.cod_us_1, 1, v_progress, v_estado)
              ON CONFLICT (cod_us, cod_logro) DO UPDATE
              SET progreso = v_progress,
                  estado_logro = v_estado,
                  fecha_obtencion_logro = CASE 
                      WHEN v_count >= 1 AND usuario_logro.estado_logro::text != 'completado' 
                      THEN NOW() 
                      ELSE usuario_logro.fecha_obtencion_logro 
                  END;
              
              -- Usuario 2
              SELECT COUNT(*) INTO v_count
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_2 OR cod_us_2 = NEW.cod_us_2)
                AND estado_inter = 'completado';
              
              v_progress := LEAST((v_count::NUMERIC / 1) * 100, 100);
              v_estado := CASE WHEN v_count >= 1 THEN 'completado' ELSE 'en_progreso' END;
              
              INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
              VALUES (NEW.cod_us_2, 1, v_progress, v_estado)
              ON CONFLICT (cod_us, cod_logro) DO UPDATE
              SET progreso = v_progress,
                  estado_logro = v_estado,
                  fecha_obtencion_logro = CASE 
                      WHEN v_count >= 1 AND usuario_logro.estado_logro::text != 'completado' 
                      THEN NOW() 
                      ELSE usuario_logro.fecha_obtencion_logro 
                  END;
              
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

        console.log('   ✅ Intercambios OK');

        // Verificar
        const triggers = await prisma.$queryRaw`
      SELECT t.tgname, c.relname as tabla
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      WHERE (t.tgname LIKE '%achievement%' OR t.tgname LIKE '%logro%')
        AND NOT t.tgisinternal
      ORDER BY c.relname, t.tgname
    `;

        console.log('\n' + '='.repeat(70));
        console.log('✅ SISTEMA DE LOGROS AUTOMÁTICO COMPLETO');
        console.log('='.repeat(70));
        console.log(`\nTriggers instalados: ${triggers.length}/2`);
        triggers.forEach(t => {
            console.log(`  ✓ ${t.tgname} → ${t.tabla}`);
        });

        console.log('\n🎯 Logros automáticos funcionando:');
        console.log('  1️⃣  Primer Intercambio');
        console.log('      → Se actualiza al completar un intercambio');
        console.log('  2️⃣  Emprendedor Verde');
        console.log('      → Se actualiza al publicar producto ecológico');
        console.log('\n💡 Prueba ahora:');
        console.log('  • Publica un producto con impacto ambiental > 0');
        console.log('  • Completa un intercambio');
        console.log('  • Ve a /logros para ver el progreso actualizado');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createBothTriggersFinal();
