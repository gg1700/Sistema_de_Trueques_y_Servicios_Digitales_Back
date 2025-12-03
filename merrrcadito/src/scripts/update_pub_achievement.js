const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Contar publicaciones
    const result = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM publicacion
    WHERE cod_us = 86
      AND impacto_amb_pub > 0
      AND estado_pub = 'activo'
  `;

    const count = parseInt(result[0].count);
    const progress = Math.min((count / 25) * 100, 100);

    console.log(`Publicaciones ecológicas: ${count}/25`);
    console.log(`Progreso: ${progress.toFixed(1)}%`);

    // Actualizar
    await prisma.$executeRawUnsafe(`
    INSERT INTO usuario_logro (cod_us, cod_logro, progreso, estado_logro)
    VALUES (86, 5, ${progress}, 'en_progreso')
    ON CONFLICT (cod_us, cod_logro) 
    DO UPDATE SET progreso = ${progress}
  `);

    console.log('✅ Actualizado!');

    // Verificar
    const check = await prisma.$queryRaw`
    SELECT progreso FROM usuario_logro WHERE cod_us = 86 AND cod_logro = 5
  `;

    console.log(`Progreso en BD: ${check[0]?.progreso}%`);

    await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
