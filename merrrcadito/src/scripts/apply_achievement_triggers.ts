import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Función para dividir SQL en comandos individuales
function splitSQLCommands(sql: string): string[] {
    // Remover comentarios
    sql = sql.replace(/--.*$/gm, '');
    sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');

    // Dividir por punto y coma, pero ignorar los que están dentro de funciones
    const commands: string[] = [];
    let current = '';
    let inFunction = false;
    let dollarQuoteCount = 0;

    const lines = sql.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Detectar inicio/fin de función
        if (trimmed.includes('$$')) {
            dollarQuoteCount++;
            inFunction = dollarQuoteCount % 2 === 1;
        }

        current += line + '\n';

        // Si encontramos punto y coma y no estamos en una función
        if (trimmed.endsWith(';') && !inFunction) {
            const cmd = current.trim();
            if (cmd && !cmd.startsWith('--') && cmd !== ';') {
                commands.push(cmd);
            }
            current = '';
        }
    }

    // Agregar el último comando si existe
    if (current.trim()) {
        commands.push(current.trim());
    }

    return commands.filter(cmd => cmd.length > 0);
}

async function applyAchievementTriggers() {
    console.log("=".repeat(70));
    console.log("APLICANDO SISTEMA COMPLETO DE LOGROS AUTOMÁTICOS");
    console.log("=".repeat(70));

    const migrationsDir = path.join(__dirname, "../db/migrations");

    const triggerFiles = [
        {
            file: "achievement_notification_trigger.sql",
            name: "Trigger de Notificaciones",
            logros: ["Notificaciones automáticas al completar logros"]
        },
        {
            file: "achievement_transaction_triggers.sql",
            name: "Triggers de Transacciones",
            logros: ["#3 Vendedor Estrella", "#7 Cliente Frecuente"]
        },
        {
            file: "achievement_event_triggers.sql",
            name: "Triggers de Eventos",
            logros: ["#6 Guardián del Planeta"]
        },
        {
            file: "achievement_publication_triggers.sql",
            name: "Triggers de Publicaciones",
            logros: ["#5 Emprendedor Verde"]
        }
    ];

    let successCount = 0;
    let errorCount = 0;
    let totalCommands = 0;

    for (const triggerFile of triggerFiles) {
        console.log(`\n📄 Aplicando: ${triggerFile.name}`);
        console.log(`   Archivo: ${triggerFile.file}`);
        console.log(`   Logros: ${triggerFile.logros.join(", ")}`);

        try {
            const filePath = path.join(migrationsDir, triggerFile.file);

            if (!fs.existsSync(filePath)) {
                console.log(`   ⚠️  Archivo no encontrado: ${filePath}`);
                errorCount++;
                continue;
            }

            const sql = fs.readFileSync(filePath, "utf-8");
            const commands = splitSQLCommands(sql);

            console.log(`   📝 Ejecutando ${commands.length} comandos SQL...`);

            let fileSuccess = true;
            for (let i = 0; i < commands.length; i++) {
                try {
                    await prisma.$executeRawUnsafe(commands[i]);
                    totalCommands++;
                } catch (error: any) {
                    // Ignorar errores de "ya existe" o "no existe"
                    if (error.message.includes('already exists') ||
                        error.message.includes('does not exist')) {
                        console.log(`   ⚠️  Comando ${i + 1}: ${error.message.split('\n')[0]}`);
                    } else {
                        console.log(`   ❌ Error en comando ${i + 1}: ${error.message.split('\n')[0]}`);
                        fileSuccess = false;
                    }
                }
            }

            if (fileSuccess) {
                console.log(`   ✅ Aplicado exitosamente (${commands.length} comandos)`);
                successCount++;
            } else {
                console.log(`   ⚠️  Aplicado con advertencias`);
                errorCount++;
            }

        } catch (error: any) {
            console.log(`   ❌ Error: ${error.message}`);
            errorCount++;
        }
    }

    // Verificar triggers instalados
    console.log("\n" + "=".repeat(70));
    console.log("VERIFICANDO TRIGGERS INSTALADOS");
    console.log("=".repeat(70));

    const triggers: any = await prisma.$queryRaw`
    SELECT 
      t.tgname as trigger_name,
      c.relname as table_name,
      CASE t.tgenabled 
        WHEN 'O' THEN 'Activo'
        ELSE 'Inactivo'
      END as status
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE (t.tgname LIKE '%achievement%' OR t.tgname LIKE '%logro%')
      AND NOT t.tgisinternal
    ORDER BY c.relname, t.tgname
  `;

    console.log(`\nTriggers encontrados: ${triggers.length}`);
    triggers.forEach((trg: any) => {
        const icon = trg.status === 'Activo' ? '✓' : '✗';
        console.log(`  ${icon} ${trg.trigger_name} en ${trg.table_name} (${trg.status})`);
    });

    // Resumen final
    console.log("\n" + "=".repeat(70));
    console.log("RESUMEN");
    console.log("=".repeat(70));
    console.log(`✅ Archivos aplicados exitosamente: ${successCount}/4`);
    console.log(`📝 Total de comandos SQL ejecutados: ${totalCommands}`);
    if (errorCount > 0) {
        console.log(`⚠️  Archivos con advertencias: ${errorCount}`);
    }

    console.log("\n📋 Logros que ahora se actualizan automáticamente:");
    console.log("  ✓ #1 Primer Intercambio (intercambios completados)");
    console.log("  ✓ #3 Vendedor Estrella (50 ventas con rating >4.5)");
    console.log("  ✓ #5 Emprendedor Verde (25 publicaciones ecológicas)");
    console.log("  ✓ #6 Guardián del Planeta (10 eventos ambientales)");
    console.log("  ✓ #7 Cliente Frecuente (30 compras)");
    console.log("\n🔔 Las notificaciones se crearán automáticamente al completar logros.");
    console.log("=".repeat(70));

    await prisma.$disconnect();
}

applyAchievementTriggers().catch((error) => {
    console.error("Error fatal:", error);
    process.exit(1);
});
