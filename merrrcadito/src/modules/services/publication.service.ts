import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtener todas las publicaciones activas de un usuario
 * Nota: La tabla publicacion NO tiene campo estado_pub.
 * El estado está en servicio.estado_serv y producto.estado_prod
 */
export async function getUserPublications(cod_us: number) {
  try {
    const publications = await prisma.$queryRaw`
      SELECT 
        p.cod_pub,
        p.fecha_ini_pub,
        p.fecha_fin_pub,
        prod.nom_prod,
        prod.precio_prod,
        prod.estado_prod,
        serv.nom_serv,
        serv.precio_serv,
        serv.estado_serv,
        COALESCE(prod.nom_prod, serv.nom_serv, 'Publicación #' || p.cod_pub) as contenido
      FROM publicacion p
      LEFT JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
      LEFT JOIN producto prod ON pp.cod_prod = prod.cod_prod
      LEFT JOIN publicacion_servicio ps ON p.cod_pub = ps.cod_pub
      LEFT JOIN servicio serv ON ps.cod_serv = serv.cod_serv
      WHERE p.cod_us = ${cod_us}
        AND (
          prod.estado_prod = 'disponible' 
          OR serv.estado_serv = 'disponible'
          OR (prod.cod_prod IS NULL AND serv.cod_serv IS NULL)
        )
      ORDER BY p.fecha_ini_pub DESC
    ` as any[];

    return publications;
  } catch (err) {
    console.error('Error en getUserPublications:', err);
    throw new Error('Error al obtener publicaciones del usuario: ' + (err as Error).message);
  }
}
