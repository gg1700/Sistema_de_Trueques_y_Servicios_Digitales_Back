const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAchievements() {
    console.log('='.repeat(70));
    console.log('ESTABLECIENDO PROGRESO MANUAL DE LOGROS (Usuario 86)');
    console.log('='.repeat(70));

    const manualAchievements = [
        { id: 2, titulo: 'Vendedor Estrella', progreso: 45, estado: 'en_progreso' },
        { id: 3, titulo: 'Cliente Frecuente', progreso: 80, estado: 'en_progreso' },
        { id: 4, titulo: 'Guardián del Planeta', progreso: 100, estado: 'completado' },
        { id: 6, titulo: 'Reductor de CO2', progreso: 15, estado: 'en_progreso' },
        { id: 7, titulo: 'Influencer Sostenible', progreso: 0, estado: 'en_progreso' },
        { id: 8, titulo: 'Referidor Exitoso', progreso: 100, estado: 'completado' },
        { id: 9, titulo: 'Aprendiz Constante', progreso: 60, estado: 'en_progreso' },
        { id: 10, titulo: 'Maestro del Reciclaje', progreso: 90, estado: 'en_progreso' },
        { id: 11, titulo: 'Coleccionista', progreso: 10, estado: 'en_progreso' },
        { id: 12, titulo: 'Pionero', progreso: 100, estado: 'completado' },
        { id: 13, titulo: 'Embajador Ambiental', progreso: 5, estado: 'en_progreso' }
    ];

    try {
        for (const logro of manualAchievements) {
            console.log(`Actualizando: ${logro.titulo} -> ${logro.progreso}% (${logro.estado})`);

            // Usamos SQL raw para evitar problemas con el enum, usando el cast correcto
            await prisma.$executeRawUnsafe(`
        INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro, fecha_obtencion_logro)
        VALUES (86, ${logro.id}, ${logro.progreso}, '${logro.estado}'::"AchievementState", NOW())
        ON CONFLICT (cod_us, cod_logro) DO UPDATE
        SET progreso = ${logro.progreso},
            estado_logro = '${logro.estado}'::"AchievementState",
            fecha_obtencion_logro = CASE 
                WHEN '${logro.estado}' = 'completado' AND usuario_logro.estado_logro::text != 'completado' 
                THEN NOW() 
                ELSE usuario_logro.fecha_obtencion_logro 
            END;
      `);
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ LOGROS MANUALES ACTUALIZADOS');
        console.log('='.repeat(70));
        console.log('Ve a /logros para ver la variedad de progresos.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedAchievements();
