import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixPublicationAchievement() {
    console.log("=".repeat(70));
    console.log("ACTUALIZANDO LOGRO DE PUBLICACIONES");
    console.log("=".repeat(70));

    try {
        // 1. Contar publicaciones ecológicas del usuario 86
        console.log("\n📊 Contando publicaciones ecológicas...");

        const publications = await prisma.publicacion.count({
            where: {
                cod_us: 86,
                impacto_amb_pub: { gt: 0 },
                estado_pub: 'activo'
            }
        });

        const progress = Math.min((publications / 25) * 100, 100);
        const estado = publications >= 25 ? 'completado' : 'en_progreso';

        console.log(`   ✅ Publicaciones ecológicas encontradas: ${publications}/25`);
        console.log(`   📈 Progreso calculado: ${progress.toFixed(1)}%`);
        console.log(`   📌 Estado: ${estado}`);

        // 2. Actualizar usando Prisma ORM
        console.log("\n💾 Actualizando base de datos...");

        const updated = await prisma.usuario_logro.upsert({
            where: {
                cod_us_cod_logro: {
                    cod_us: 86,
                    cod_logro: 5
                }
            },
            update: {
                progreso: progress,
                estado_logro: estado as any
            },
            create: {
                cod_us: 86,
                cod_logro: 5,
                progreso: progress,
                estado_logro: estado as any
            }
        });

        console.log("   ✅ Progreso actualizado");

        // 3. Verificar el resultado
        console.log("\n🔍 Verificando resultado...");
        const verification = await prisma.usuario_logro.findUnique({
            where: {
                cod_us_cod_logro: {
                    cod_us: 86,
                    cod_logro: 5
                }
            },
            include: {
                logro: true
            }
        });

        if (verification) {
            console.log(`\n   🏆 ${verification.logro.titulo_logro}`);
            console.log(`      📊 Progreso: ${verification.progreso}%`);
            console.log(`      📌 Estado: ${verification.estado_logro}`);
        }

        console.log("\n" + "=".repeat(70));
        console.log("✅ LOGRO ACTUALIZADO CORRECTAMENTE");
        console.log("=".repeat(70));
        console.log("\n💡 Recarga la página /logros para ver el progreso actualizado");

    } catch (error: any) {
        console.error("\n❌ Error:", error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

fixPublicationAchievement().catch(console.error);
