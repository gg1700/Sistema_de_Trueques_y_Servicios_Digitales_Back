
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const cod_pub = 48;
        console.log(`--- Debugging Price Query for Pub ${cod_pub} ---`);

        const price = await prisma.$queryRaw`
      SELECT 
        COALESCE(prod.precio_prod, serv.precio_serv) as precio_original,
        COALESCE(pub_prod.cant_prod, 1) as cant_prod,
        COALESCE(prom.descuento_prom, 0) as descuento,
        (COALESCE(prod.precio_prod, serv.precio_serv) * COALESCE(pub_prod.cant_prod, 1)) as total_original,
        (COALESCE(prod.precio_prod, serv.precio_serv) * COALESCE(pub_prod.cant_prod, 1) * (1 - COALESCE(prom.descuento_prom, 0)/100)) as total_con_descuento,
        prom.titulo_prom,
        prom.cod_prom,
        CASE 
          WHEN prom.cod_prom IS NOT NULL THEN true
          ELSE false
        END as tiene_promocion
      FROM publicacion pub
      LEFT JOIN publicacion_producto pub_prod ON pub.cod_pub = pub_prod.cod_pub
      LEFT JOIN producto prod ON pub_prod.cod_prod = prod.cod_prod
      LEFT JOIN publicacion_servicio pub_serv ON pub.cod_pub = pub_serv.cod_pub
      LEFT JOIN servicio serv ON pub_serv.cod_serv = serv.cod_serv
      LEFT JOIN publicacion_promocion pp ON pub.cod_pub = pp.cod_pub
      LEFT JOIN promocion prom ON pp.cod_prom = prom.cod_prom
        AND prom.fecha_ini_prom <= NOW() 
        AND prom.fecha_fin_prom >= NOW()
      WHERE pub.cod_pub = ${cod_pub}
      ORDER BY prom.descuento_prom DESC NULLS LAST
      LIMIT 1
    `;

        console.log(JSON.stringify(price, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
