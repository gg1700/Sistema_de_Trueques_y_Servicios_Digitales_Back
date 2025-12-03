import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function analyzeAchievements() {
    console.log("=".repeat(60));
    console.log("ANÁLISIS DEL SISTEMA DE LOGROS");
    console.log("=".repeat(60));

    // 1. Ver todos los logros registrados
    console.log("\n📋 LOGROS REGISTRADOS EN LA BASE DE DATOS:");
    console.log("-".repeat(60));
    const achievements: any = await prisma.$queryRaw`
    SELECT cod_logro, titulo_logro, descr_logro, calidad_logro
    FROM logro
    ORDER BY cod_logro
  `;

    achievements.forEach((ach: any) => {
        console.log(`\n🏆 [${ach.cod_logro}] ${ach.titulo_logro}`);
        console.log(`   📝 ${ach.descr_logro}`);
        console.log(`   ⭐ Calidad: ${ach.calidad_logro}`);
    });

    // 2. Ver triggers activos relacionados con logros
    console.log("\n\n🔧 TRIGGERS ACTIVOS PARA LOGROS:");
    console.log("-".repeat(60));
    const triggers: any = await prisma.$queryRaw`
    SELECT 
      t.tgname as trigger_name,
      c.relname as table_name,
      t.tgenabled as enabled,
      pg_get_triggerdef(t.oid) as definition
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname LIKE '%achievement%'
       OR t.tgname LIKE '%logro%'
    ORDER BY c.relname, t.tgname
  `;

    if (triggers.length === 0) {
        console.log("⚠️  NO HAY TRIGGERS ACTIVOS PARA LOGROS");
    } else {
        triggers.forEach((trg: any) => {
            console.log(`\n✓ ${trg.trigger_name} en tabla ${trg.table_name}`);
            console.log(`  Estado: ${trg.enabled === 'O' ? 'Activo' : 'Inactivo'}`);
        });
    }

    // 3. Ver progreso de logros de un usuario ejemplo
    console.log("\n\n👤 PROGRESO DE LOGROS (Usuario ID 86):");
    console.log("-".repeat(60));
    const userProgress: any = await prisma.$queryRaw`
    SELECT 
      l.titulo_logro,
      COALESCE(ul.progreso, 0) as progreso,
      COALESCE(ul.estado_logro::text, 'no_iniciado') as estado,
      ul.fecha_obtencion_logro
    FROM logro l
    LEFT JOIN usuario_logro ul ON l.cod_logro = ul.cod_logro AND ul.cod_us = 86
    ORDER BY l.cod_logro
  `;

    userProgress.forEach((prog: any) => {
        const status = prog.estado === 'completado' ? '✅' :
            prog.estado === 'en_progreso' ? '🔄' : '⏸️';
        console.log(`${status} ${prog.titulo_logro}: ${prog.progreso}% (${prog.estado})`);
        if (prog.fecha_obtencion_logro) {
            console.log(`   Obtenido: ${new Date(prog.fecha_obtencion_logro).toLocaleDateString()}`);
        }
    });

    // 4. Verificar función check_achievement_progress
    console.log("\n\n🔍 VERIFICANDO FUNCIÓN check_achievement_progress:");
    console.log("-".repeat(60));
    const functionExists: any = await prisma.$queryRaw`
    SELECT proname, prosrc
    FROM pg_proc
    WHERE proname = 'check_achievement_progress'
  `;

    if (functionExists.length > 0) {
        console.log("✓ Función check_achievement_progress existe");
    } else {
        console.log("⚠️  Función check_achievement_progress NO EXISTE");
    }

    // 5. Verificar trigger de notificaciones
    console.log("\n\n🔔 VERIFICANDO TRIGGER DE NOTIFICACIONES:");
    console.log("-".repeat(60));
    const notifTriggers: any = await prisma.$queryRaw`
    SELECT tgname, tgenabled
    FROM pg_trigger
    WHERE tgrelid = 'usuario_logro'::regclass
      AND tgname LIKE '%notification%'
  `;

    if (notifTriggers.length > 0) {
        notifTriggers.forEach((trg: any) => {
            console.log(`✓ ${trg.tgname}: ${trg.tgenabled === 'O' ? 'Activo' : 'Inactivo'}`);
        });
    } else {
        console.log("⚠️  NO HAY TRIGGER DE NOTIFICACIONES");
    }

    console.log("\n" + "=".repeat(60));
    console.log("FIN DEL ANÁLISIS");
    console.log("=".repeat(60));

    await prisma.$disconnect();
}

analyzeAchievements().catch(console.error);
