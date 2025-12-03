import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePasswords() {
    try {
        console.log('🔐 Iniciando migración de contraseñas...\n');

        // Obtener todos los usuarios con contraseñas en texto plano
        const users = await prisma.$queryRaw`
      SELECT cod_us, correo_us, handle_name, contra_us 
      FROM usuario 
      WHERE contra_us NOT LIKE '$2%'
    ` as any[];

        console.log(`📊 Encontrados ${users.length} usuarios con contraseñas en texto plano\n`);

        if (users.length === 0) {
            console.log('✅ No hay contraseñas para migrar. Todas están hasheadas correctamente.');
            await prisma.$disconnect();
            return;
        }

        let migratedCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                console.log(`🔄 Migrando usuario ${user.cod_us} (${user.handle_name})...`);

                // Hashear la contraseña en texto plano
                const hashedPassword = await bcrypt.hash(user.contra_us, 10);

                // Actualizar en la base de datos
                await prisma.$queryRaw`
          UPDATE usuario 
          SET contra_us = ${hashedPassword}
          WHERE cod_us = ${user.cod_us}
        `;

                console.log(`   ✅ Usuario ${user.cod_us} migrado exitosamente`);
                console.log(`   📧 Correo: ${user.correo_us}`);
                console.log(`   🔑 Contraseña original: ${user.contra_us}`);
                console.log(`   🔐 Hash generado: ${hashedPassword.substring(0, 20)}...\n`);

                migratedCount++;
            } catch (error) {
                console.error(`   ❌ Error migrando usuario ${user.cod_us}:`, error);
                errorCount++;
            }
        }

        console.log('\n========================================');
        console.log('📊 RESUMEN DE MIGRACIÓN');
        console.log('========================================');
        console.log(`✅ Usuarios migrados exitosamente: ${migratedCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`📝 Total procesados: ${users.length}`);
        console.log('========================================\n');

        if (migratedCount > 0) {
            console.log('⚠️  IMPORTANTE: Guarda las contraseñas originales mostradas arriba');
            console.log('⚠️  Los usuarios deberán usar esas contraseñas para hacer login\n');
        }

        await prisma.$disconnect();
        console.log('✅ Migración completada. Base de datos desconectada.');

    } catch (error) {
        console.error('💥 Error fatal en la migración:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

// Ejecutar la migración
migratePasswords()
    .then(() => {
        console.log('\n🎉 Script finalizado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error ejecutando el script:', error);
        process.exit(1);
    });
