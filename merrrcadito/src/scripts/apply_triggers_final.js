const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyWorkingTriggers() {
    console.log('='.repeat(70));
    console.log('APLICANDO TRIGGERS DE LOGROS - VERSIÓN FINAL');
    console.log('='.repeat(70));

    try {
        // ========================================
        // 1. TRIGGER DE PUBLICACIONES
        // ========================================
        console.log('\n📄 1/2 Aplicando trigger de publicaciones...');

        await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_publication_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count INTEGER;
          v_progress NUMERIC;
      BEGIN
          SELECT COUNT(*) INTO v_count
          FROM publicacion
          WHERE cod_us = NEW.cod_us
            AND impacto_amb_pub > 0
            AND estado_pub = 'activo';
          
          v_progress := LEAST((v_count::NUMERIC / 25) * 100, 100);
          
          INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
          VALUES (NEW.cod_us, 5, v_progress, 
                  CASE WHEN v_count >= 25 THEN 'completado'::"AchievementState" ELSE 'en_progreso'::"AchievementState" END)
          ON CONFLICT (cod_us, cod_logro) DO UPDATE
          SET progreso = v_progress,
              estado_logro = CASE WHEN v_count >= 25 THEN 'completado'::"AchievementState" ELSE 'en_progreso'::"AchievementState" END,
              fecha_obtencion_logro = CASE 
                  WHEN v_count >= 25 AND usuario_logro.estado_logro::text != 'completado' 
                  THEN NOW() 
                  ELSE usuario_logro.fecha_obtencion_logro 
              END;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_achievement_publication ON publicacion`);
        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_achievement_publication
      AFTER INSERT OR UPDATE ON publicacion
      FOR EACH ROW
      WHEN (NEW.impacto_amb_pub > 0 AND NEW.estado_pub = 'activo')
      EXECUTE FUNCTION update_publication_achievement()
    `);

        console.log('   ✅ Trigger de publicaciones creado');

        // ========================================
        // 2. TRIGGER DE INTERCAMBIOS
        // ========================================
        console.log('\n📄 2/2 Aplicando trigger de intercambios...');

        await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_exchange_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count1 INTEGER;
          v_count2 INTEGER;
          v_progress1 NUMERIC;
          v_progress2 NUMERIC;
      BEGIN
          IF NEW.estado_inter = 'completado' THEN
              -- Usuario 1
              SELECT COUNT(*) INTO v_count1
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_1 OR cod_us_2 = NEW.cod_us_1)
                AND estado_inter = 'completado';
              
              v_progress1 := LEAST((v_count1::NUMERIC / 1) * 100, 100);
              
              INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
              VALUES (NEW.cod_us_1, 1, v_progress1, 
                      CASE WHEN v_count1 >= 1 THEN 'completado'::"AchievementState" ELSE 'en_progreso'::"AchievementState" END)
              ON CONFLICT (cod_us, cod_logro) DO UPDATE
              SET progreso = v_progress1,
                  estado_logro = CASE WHEN v_count1 >= 1 THEN 'completado'::"AchievementState" ELSE 'en_progreso'::"AchievementState" END,
                  fecha_obtencion_logro = CASE 
                      WHEN v_count1 >= 1 AND usuario_logro.estado_logro::text != 'completado' 
                      THEN NOW() 
                      ELSE usuario_logro.fecha_obtencion_logro 
                  END;
              
              -- Usuario 2
              SELECT COUNT(*) INTO v_count2
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_2 OR cod_us_2 = NEW.cod_us_2)
                AND estado_inter = 'completado';
              
              v_progress2 := LEAST((v_count2::NUMERIC / 1) * 100, 100);
              
              INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
              VALUES (NEW.cod_us_2, 1, v_progress2, 
                      CASE WHEN v_count2 >= 1 THEN 'completado'::"AchievementState" ELSE 'en_progreso'::"AchievementState" END)
              ON CONFLICT (cod_us, cod_logro) DO UPDATE
              SET progreso = v_progress2,
                  estado_logro = CASE WHEN v_count2 >= 1 THEN 'completado'::"AchievementState" ELSE 'en_progreso'::"AchievementState" END,
                  fecha_obtencion_logro = CASE 
                      WHEN v_count2 >= 1 AND usuario_logro.estado_logro::text != 'completado' 
                      THEN NOW() 
                      ELSE usuario_logro.fecha_obtencion_logro 
                  END;
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_check_achievement_exchange ON intercambio`);
        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_check_achievement_exchange
      AFTER UPDATE ON intercambio
      FOR EACH ROW
      WHEN (OLD.estado_inter IS DISTINCT FROM NEW.estado_inter AND NEW.estado_inter = 'completado')
      EXECUTE FUNCTION update_exchange_achievement()
    `);

        console.log('   ✅ Trigger de intercambios creado');

        // ========================================
        // VERIFICACIÓN
        // ========================================
        console.log('\n' + '='.repeat(70));
        console.log('VERIFICANDO INSTALACIÓN');
        console.log('='.repeat(70));

        const triggers = await prisma.$queryRaw`
      SELECT t.tgname, c.relname as tabla
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      WHERE t.tgname IN ('trg_achievement_publication', 'trg_check_achievement_exchange')
        AND NOT t.tgisinternal
    `;

        console.log(`\n✅ Triggers instalados: ${triggers.length}/2`);
        triggers.forEach(t => {
            console.log(`   ✓ ${t.tgname} → tabla ${t.tabla}`);
        });

        // Actualizar progreso actual
        console.log('\n📊 Actualizando progreso actual del usuario 86...');
        await prisma.$executeRawUnsafe(`SELECT update_publication_achievement() FROM publicacion WHERE cod_us=86 AND impacto_amb_pub>0 LIMIT 1`);

        const current = await prisma.$queryRaw`
      SELECT l.titulo_logro, ul.progreso, ul.estado_logro::text as estado
      FROM usuario_logro ul
      JOIN logro l ON ul.cod_logro = l.cod_logro
      WHERE ul.cod_us = 86 AND ul.cod_logro IN (1, 5)
      ORDER BY ul.cod_logro
    `;

        console.log('\nProgreso actual:');
        current.forEach(r => {
            console.log(`   ${r.progreso}% - ${r.titulo_logro} (${r.estado})`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('✅ ¡TRIGGERS APLICADOS EXITOSAMENTE!');
        console.log('='.repeat(70));
        console.log('\n🎯 Prueba ahora:');
        console.log('   1. Publica un nuevo producto ecológico (impacto > 0)');
        console.log('   2. Recarga /logros y verás el progreso actualizado automáticamente');
        console.log('   3. Completa un intercambio y también se actualizará');
        console.log('\n💡 Los logros ahora se actualizan en tiempo real!');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.code) console.error('Código:', error.code);
    } finally {
        await prisma.$disconnect();
    }
}

applyWorkingTriggers().catch(console.error);
