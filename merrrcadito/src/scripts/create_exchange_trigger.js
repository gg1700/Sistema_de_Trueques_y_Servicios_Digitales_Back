const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createExchangeTrigger() {
    console.log('='.repeat(70));
    console.log('CREANDO TRIGGER DE INTERCAMBIOS');
    console.log('='.repeat(70));

    try {
        // 1. Limpiar triggers anteriores
        console.log('\n🧹 Limpiando triggers anteriores...');
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_check_achievement_exchange ON intercambio CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS update_exchange_achievement() CASCADE`);
        await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS check_achievement_progress() CASCADE`);
        console.log('   ✅ Limpieza completada');

        // 2. Crear función para intercambios
        console.log('\n📄 Creando función update_exchange_achievement...');

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
              -- USUARIO 1 (quien propone el intercambio)
              -- ========================================
              
              -- Contar intercambios completados del usuario 1
              SELECT COUNT(*) INTO v_count1
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_1 OR cod_us_2 = NEW.cod_us_1)
                AND estado_inter = 'completado';
              
              -- Calcular progreso (1 intercambio = 100%)
              v_progress1 := LEAST((v_count1::NUMERIC / 1) * 100, 100);
              
              -- Insertar o actualizar logro para usuario 1
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
              -- USUARIO 2 (quien recibe la propuesta)
              -- ========================================
              
              -- Contar intercambios completados del usuario 2
              SELECT COUNT(*) INTO v_count2
              FROM intercambio
              WHERE (cod_us_1 = NEW.cod_us_2 OR cod_us_2 = NEW.cod_us_2)
                AND estado_inter = 'completado';
              
              -- Calcular progreso
              v_progress2 := LEAST((v_count2::NUMERIC / 1) * 100, 100);
              
              -- Insertar o actualizar logro para usuario 2
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
        console.log('\n📄 Creando trigger trg_check_achievement_exchange...');

        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_check_achievement_exchange
      AFTER UPDATE ON intercambio
      FOR EACH ROW
      WHEN (OLD.estado_inter IS DISTINCT FROM NEW.estado_inter AND NEW.estado_inter = 'completado')
      EXECUTE FUNCTION update_exchange_achievement()
    `);

        console.log('   ✅ Trigger creado');

        // 4. Verificar instalación
        console.log('\n🔍 Verificando instalación...');
        const triggers = await prisma.$queryRaw`
      SELECT t.tgname, c.relname as tabla
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      WHERE (t.tgname LIKE '%achievement%' OR t.tgname LIKE '%logro%')
        AND NOT t.tgisinternal
      ORDER BY t.tgname
    `;

        console.log('\n' + '='.repeat(70));
        console.log('✅ TRIGGERS INSTALADOS');
        console.log('='.repeat(70));
        console.log(`\nTotal: ${triggers.length} triggers activos`);
        triggers.forEach(t => {
            console.log(`  ✓ ${t.tgname} → ${t.tabla}`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('🎯 SISTEMA DE LOGROS AUTOMÁTICO COMPLETO');
        console.log('='.repeat(70));
        console.log('\n✅ Logros que se actualizan automáticamente:');
        console.log('   1. Primer Intercambio (al completar intercambio)');
        console.log('   2. Emprendedor Verde (al publicar producto ecológico)');
        console.log('\n💡 Valores del enum usados:');
        console.log('   - "en_progreso" (con guión bajo)');
        console.log('   - "completado"');
        console.log('\n🎯 Prueba ahora:');
        console.log('   • Completa un intercambio → Actualiza "Primer Intercambio"');
        console.log('   • Publica producto ecológico → Actualiza "Emprendedor Verde"');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

createExchangeTrigger();
