const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixExchangeTrigger() {
    console.log('='.repeat(70));
    console.log('ARREGLANDO TRIGGER DE INTERCAMBIOS (FINAL)');
    console.log('='.repeat(70));

    try {
        // 1. Limpiar
        console.log('\n🧹 Eliminando trigger anterior...');
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_check_achievement_exchange ON intercambio CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_exchange_achievement() CASCADE`);

        // 2. Crear función
        console.log('\n📄 Creando función corregida...');

        // NOTA: Usamos 'en_progreso' y 'completado' (minúsculas, guión bajo)
        // y hacemos el cast ::"AchievementState" al final.
        await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_exchange_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count1 INTEGER;
          v_count2 INTEGER;
          v_progress1 NUMERIC;
          v_progress2 NUMERIC;
      BEGIN
          -- Solo procesar cuando el intercambio se completa
          IF NEW.estado_inter = 'completado' THEN
              
              -- ========================================
              -- USUARIO 1
              -- ========================================
              SELECT COUNT(*) INTO v_count1
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_1 OR cod_us_2 = NEW.cod_us_1)
                AND estado_inter = 'completado';
              
              v_progress1 := LEAST((v_count1::NUMERIC / 1) * 100, 100);
              
              INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
              VALUES (
                NEW.cod_us_1, 
                1, 
                v_progress1, 
                (CASE WHEN v_count1 >= 1 THEN 'completado' ELSE 'en_progreso' END)::"AchievementState"
              )
              ON CONFLICT (cod_us, cod_logro) DO UPDATE
              SET progreso = v_progress1,
                  estado_logro = (CASE WHEN v_count1 >= 1 THEN 'completado' ELSE 'en_progreso' END)::"AchievementState",
                  fecha_obtencion_logro = CASE 
                      WHEN v_count1 >= 1 AND usuario_logro.estado_logro::text != 'completado' 
                      THEN NOW() 
                      ELSE usuario_logro.fecha_obtencion_logro 
                  END;
              
              -- ========================================
              -- USUARIO 2
              -- ========================================
              SELECT COUNT(*) INTO v_count2
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_2 OR cod_us_2 = NEW.cod_us_2)
                AND estado_inter = 'completado';
              
              v_progress2 := LEAST((v_count2::NUMERIC / 1) * 100, 100);
              
              INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
              VALUES (
                NEW.cod_us_2, 
                1, 
                v_progress2, 
                (CASE WHEN v_count2 >= 1 THEN 'completado' ELSE 'en_progreso' END)::"AchievementState"
              )
              ON CONFLICT (cod_us, cod_logro) DO UPDATE
              SET progreso = v_progress2,
                  estado_logro = (CASE WHEN v_count2 >= 1 THEN 'completado' ELSE 'en_progreso' END)::"AchievementState",
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

        console.log('   ✅ Función creada');

        // 3. Crear trigger
        console.log('\n📄 Creando trigger...');
        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_check_achievement_exchange
      AFTER UPDATE ON intercambio
      FOR EACH ROW
      WHEN (OLD.estado_inter IS DISTINCT FROM NEW.estado_inter AND NEW.estado_inter = 'completado')
      EXECUTE FUNCTION update_exchange_achievement()
    `);

        console.log('   ✅ Trigger creado');

        // 4. Verificación
        const triggers = await prisma.$queryRaw`
      SELECT tgname, tgrelid::regclass::text as tabla
      FROM pg_trigger
      WHERE tgname = 'trg_check_achievement_exchange'
    `;

        console.log('\n' + '='.repeat(70));
        if (triggers.length > 0) {
            console.log('✅ TRIGGER DE INTERCAMBIOS INSTALADO CORRECTAMENTE');
            console.log(`   Tabla: ${triggers[0].tabla}`);
        } else {
            console.log('❌ ERROR: No se encontró el trigger instalado');
        }
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixExchangeTrigger();
