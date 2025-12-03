
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Publicaciones de tipo Servicio ---');
        const services = await prisma.$queryRaw`
      SELECT pu.cod_pub, ps.cod_serv
      FROM publicacion pu
      JOIN publicacion_servicio ps ON ps.cod_pub = pu.cod_pub
      LIMIT 5
    `;
        console.log(JSON.stringify(services, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
