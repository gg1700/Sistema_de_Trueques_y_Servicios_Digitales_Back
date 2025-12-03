const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyTriggersWithoutCast() {
    console.log('='.repeat(70));
    console.log('APLICANDO TRIGGERS - SIN CASTING EXPLÍCITO');
    console.log('='.repeat(70));

    try {
        // Primero, eliminar triggers existentes
        console.log('\n🧹 Limpiando triggers anteriores...');
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_achievement_publication ON publicacion`);
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_check_achievement_exchange ON intercambio`);
        console.log('   ✅ Limpieza completada');

        // ========================================
        // 1. FUNCIÓN Y TRIGGER DE PUBLICACIONES
        // ========================================
        console.log('\n📄 1/2 Creando trigger de publicaciones...');

        const pubFunction = `
      CREATE OR REPLACE FUNCTION update_publication_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count INTEGER;
          v_progress NUMERIC;
          v_estado "AchievementState";
      BEGIN
          SELECT COUNT(*) INTO v_count
          FROM publicacion
          WHERE cod_us = NEW.cod_us
            AND impacto_amb_pub > 0
            AND estado_pub = 'activo';
          
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
    `;

        await prisma.$executeRawUnsafe(pubFunction);

        const pubTrigger = `
      CREATE TRIGGER trg_achievement_publication
      AFTER INSERT OR UPDATE ON publicacion
      FOR EACH ROW
      WHEN (NEW.impacto_amb_pub > 0 AND NEW.estado_pub = 'activo')
      EXECUTE FUNCTION update_publication_achievement()
    `;

        await prisma.$executeRawUnsafe(pubTrigger);
        console.log('   ✅ Trigger de publicaciones creado');

        // ========================================
        // 2. FUNCIÓN Y TRIGGER DE INTERCAMBIOS
        // ========================================
        console.log('\n📄 2/2 Creando trigger de intercambios...');

        const exchFunction = `
      CREATE OR REPLACE FUNCTION update_exchange_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count1 INTEGER;
          v_count2 INTEGER;
          v_progress1 NUMERIC;
          v_progress2 NUMERIC;
          v_estado1 "AchievementState";
          v_estado2 "AchievementState";
      BEGIN
          IF NEW.estado_inter = 'completado' THEN
              -- Usuario 1
              SELECT COUNT(*) INTO v_count1
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_1 OR cod_us_2 = NEW.cod_us_1)
                AND estado_inter = 'completado';
              
              v_progress1 := LEAST((v_count1::NUMERIC / 1) * 100, 100);
              v_estado1 := CASE WHEN v_count1 >= 1 THEN 'completado' ELSE 'en_progreso' END;
              
              INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
              VALUES (NEW.cod_us_1, 1, v_progress1, v_estado1)
              ON CONFLICT (cod_us, cod_logro) DO UPDATE
              SET progreso = v_progress1,
                  estado_logro = v_estado1,
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
              v_estado2 := CASE WHEN v_count2 >= 1 THEN 'completado' ELSE 'en_progreso' END;
              
              INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
              VALUES (NEW.cod_us_2, 1, v_progress2, v_estado2)
              ON CONFLICT (cod_us, cod_logro) DO UPDATE
              SET progreso = v_progress2,
                  estado_logro = v_estado2,
                  fecha_obtencion_logro = CASE 
                      WHEN v_count2 >= 1 AND usuario_logro.estado_logro::text != 'completado' 
                      THEN NOW() 
                      ELSE usuario_logro.fecha_obtencion_logro 
                  END;
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

        await prisma.$executeRawUnsafe(exchFunction);

        const exchTrigger = `
      CREATE TRIGGER trg_check_achievement_exchange
      AFTER UPDATE ON intercambio
      FOR EACH ROW
      WHEN (OLD.estado_inter IS DISTINCT FROM NEW.estado_inter AND NEW.estado_inter = 'completado')
      EXECUTE FUNCTION update_exchange_achievement()
    `;

        await prisma.$executeRawUnsafe(exchTrigger);
        console.log('   ✅ Trigger de intercambios creado');

        // ========================================
        // VERIFICACIÓN
        // ========================================
        console.log('\n' + '='.repeat(70));
        console.log('VERIFICACIÓN FINAL');
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
            console.log(`   ✓ ${t.tgname} → ${t.tabla}`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('✅ ¡SISTEMA DE LOGROS AUTOMÁTICO ACTIVADO!');
        console.log('='.repeat(70));
        console.log('\n🎯 Ahora funciona automáticamente:');
        console.log('   • Publicar producto ecológico → Actualiza "Emprendedor Verde"');
        console.log('   • Completar intercambio → Actualiza "Primer Intercambio"');
        console.log('\n💡 Prueba publicando un producto y ve a /logros');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nDetalles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

applyTriggersWithoutCast().catch(console.error);
