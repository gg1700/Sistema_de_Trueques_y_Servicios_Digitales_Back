const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createExchangeTriggerFixed() {
    console.log('='.repeat(70));
    console.log('CREANDO TRIGGER DE INTERCAMBIOS - VERSIÓN CORREGIDA');
    console.log('='.repeat(70));

    try {
        console.log('\n🧹 Limpiando...');
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_check_achievement_exchange ON intercambio CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_exchange_achievement() CASCADE`);

        console.log('\n📄 Creando función con variables tipadas...');

        // Usar variables con tipo explícito para evitar problemas de casting
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

        console.log('   ✅ Función creada');

        console.log('\n📄 Creando trigger...');
        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_check_achievement_exchange
      AFTER UPDATE ON intercambio
      FOR EACH ROW
      WHEN (OLD.estado_inter IS DISTINCT FROM NEW.estado_inter AND NEW.estado_inter = 'completado')
      EXECUTE FUNCTION update_exchange_achievement()
    `);

        console.log('   ✅ Trigger creado');

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
        console.log('✅ SISTEMA COMPLETO');
        console.log('='.repeat(70));
        console.log(`\nTriggers activos: ${triggers.length}`);
        triggers.forEach(t => {
            console.log(`  ✓ ${t.tgname} → ${t.tabla}`);
        });

        console.log('\n🎯 Logros automáticos:');
        console.log('  1. Primer Intercambio (completar intercambio)');
        console.log('  2. Emprendedor Verde (publicar producto ecológico)');
        console.log('\n💡 Ahora puedes:');
        console.log('  • Completar intercambios');
        console.log('  • Publicar productos');
        console.log('  • Ver progreso en /logros');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createExchangeTriggerFixed();
