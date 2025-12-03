const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTriggerForServices() {
    console.log('='.repeat(70));
    console.log('ACTUALIZANDO TRIGGERS PARA INCLUIR SERVICIOS');
    console.log('='.repeat(70));

    try {
        // 1. Limpiar función anterior
        console.log('\n🧹 Actualizando lógica de conteo...');

        // Nueva función que cuenta:
        // - Publicaciones con impacto ambiental > 0 (Productos ecológicos)
        // - Publicaciones que están en la tabla publicacion_servicio (Servicios)
        await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_publication_achievement()
      RETURNS TRIGGER AS $$
      DECLARE
          v_count INTEGER;
          v_progress NUMERIC;
          v_estado "AchievementState";
          v_user_id INTEGER;
      BEGIN
          -- Determinar el ID de usuario dependiendo de la tabla que disparó el trigger
          IF TG_TABLE_NAME = 'publicacion_servicio' THEN
              SELECT cod_us INTO v_user_id FROM publicacion WHERE cod_pub = NEW.cod_pub;
          ELSE
              v_user_id := NEW.cod_us;
          END IF;

          -- Contar publicaciones válidas (Eco Productos + Servicios)
          SELECT COUNT(DISTINCT p.cod_pub) INTO v_count
          FROM publicacion p
          LEFT JOIN publicacion_servicio ps ON p.cod_pub = ps.cod_pub
          WHERE p.cod_us = v_user_id
            AND p.estado_pub = 'activo'
            AND (p.impacto_amb_pub > 0 OR ps.cod_pub IS NOT NULL);
          
          v_progress := LEAST((v_count::NUMERIC / 25) * 100, 100);
          v_estado := CASE WHEN v_count >= 25 THEN 'completado' ELSE 'en_progreso' END;
          
          INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
          VALUES (v_user_id, 5, v_progress, v_estado)
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

        console.log('   ✅ Función actualizada para incluir servicios');

        // 2. Trigger en publicacion (ya existe, pero lo recreamos por seguridad)
        console.log('\n📄 Verificando trigger en publicacion...');
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_achievement_publication ON publicacion`);
        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_achievement_publication
      AFTER INSERT OR UPDATE ON publicacion
      FOR EACH ROW
      WHEN (NEW.estado_pub = 'activo')
      EXECUTE FUNCTION update_publication_achievement()
    `);
        // Nota: Quité la condición NEW.impacto_amb_pub > 0 del WHEN para que el trigger dispare
        // y la función decida si cuenta o no (aunque para productos sin impacto no contará, 
        // pero si luego se convierte en servicio sí... bueno, mejor dejarlo amplio y que la función filtre).

        console.log('   ✅ Trigger en publicacion actualizado');

        // 3. NUEVO Trigger en publicacion_servicio
        console.log('\n📄 Creando trigger en publicacion_servicio...');
        await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_achievement_service ON publicacion_servicio`);
        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_achievement_service
      AFTER INSERT ON publicacion_servicio
      FOR EACH ROW
      EXECUTE FUNCTION update_publication_achievement()
    `);

        console.log('   ✅ Trigger para servicios creado');

        // 4. Verificación
        const triggers = await prisma.$queryRaw`
      SELECT tgname, tgrelid::regclass::text as tabla
      FROM pg_trigger
      WHERE tgname IN ('trg_achievement_publication', 'trg_achievement_service')
    `;

        console.log('\n' + '='.repeat(70));
        console.log('✅ ACTUALIZACIÓN COMPLETADA');
        console.log('='.repeat(70));
        triggers.forEach(t => console.log(`  ✓ ${t.tgname} → ${t.tabla}`));

        console.log('\n🎯 Ahora cuenta:');
        console.log('  • Productos con impacto ambiental > 0');
        console.log('  • TODOS los Servicios (independientemente del impacto)');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updateTriggerForServices();
