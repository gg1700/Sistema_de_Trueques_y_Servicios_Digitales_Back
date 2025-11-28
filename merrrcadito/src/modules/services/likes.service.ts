import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LikeData {
    cod_us: number;
    cod_pub: number;
}

/**
 * Agregar un "me gusta" a una publicación
 */
export async function addLike(cod_us: number, cod_pub: number) {
    try {
        // Verificar si ya existe el like
        const existing = await prisma.$queryRaw`
      SELECT * FROM me_gusta 
      WHERE cod_us = ${cod_us}::INTEGER 
      AND cod_pub = ${cod_pub}::INTEGER
    ` as any[];

        if (existing.length > 0) {
            return { success: false, message: "Ya has dado me gusta a esta publicación" };
        }

        // Insertar el like
        await prisma.$queryRaw`
      INSERT INTO me_gusta (cod_us, cod_pub, fecha_like)
      VALUES (${cod_us}::INTEGER, ${cod_pub}::INTEGER, NOW())
    `;

        return { success: true, message: "Me gusta agregado correctamente" };
    } catch (err) {
        console.error("Error en addLike:", err);
        throw new Error((err as Error).message);
    }
}

/**
 * Eliminar un "me gusta" de una publicación
 */
export async function removeLike(cod_us: number, cod_pub: number) {
    try {
        const result = await prisma.$queryRaw`
      DELETE FROM me_gusta 
      WHERE cod_us = ${cod_us}::INTEGER 
      AND cod_pub = ${cod_pub}::INTEGER
      RETURNING cod_like
    ` as any[];

        if (result.length === 0) {
            return { success: false, message: "No se encontró el me gusta" };
        }

        return { success: true, message: "Me gusta eliminado correctamente" };
    } catch (err) {
        console.error("Error en removeLike:", err);
        throw new Error((err as Error).message);
    }
}

/**
 * Obtener todas las publicaciones que le gustan a un usuario
 */
export async function getUserLikes(cod_us: number) {
    try {
        const likes = await prisma.$queryRaw`
      SELECT 
        mg.cod_like,
        mg.cod_pub,
        mg.fecha_like,
        p.foto_pub,
        p.calif_pond_pub,
        p.fecha_ini_pub,
        u.handle_name as autor_handle,
        u.nom_us as autor_nombre,
        COALESCE(prod.nom_prod, serv.nom_serv) as titulo_publicacion,
        COALESCE(prod.desc_prod, serv.desc_serv) as descripcion_publicacion,
        COALESCE(prod.precio_prod, serv.precio_serv) as precio
      FROM me_gusta mg
      INNER JOIN publicacion p ON mg.cod_pub = p.cod_pub
      INNER JOIN usuario u ON p.cod_us = u.cod_us
      LEFT JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
      LEFT JOIN producto prod ON pp.cod_prod = prod.cod_prod
      LEFT JOIN publicacion_servicio ps ON p.cod_pub = ps.cod_pub
      LEFT JOIN servicio serv ON ps.cod_serv = serv.cod_serv
      WHERE mg.cod_us = ${cod_us}::INTEGER
      ORDER BY mg.fecha_like DESC
    ` as any[];

        return { success: true, data: likes };
    } catch (err) {
        console.error("Error en getUserLikes:", err);
        throw new Error((err as Error).message);
    }
}

/**
 * Verificar si un usuario le dio like a una publicación
 */
export async function checkUserLike(cod_us: number, cod_pub: number) {
    try {
        const result = await prisma.$queryRaw`
      SELECT cod_like FROM me_gusta 
      WHERE cod_us = ${cod_us}::INTEGER 
      AND cod_pub = ${cod_pub}::INTEGER
    ` as any[];

        return { success: true, hasLiked: result.length > 0 };
    } catch (err) {
        console.error("Error en checkUserLike:", err);
        throw new Error((err as Error).message);
    }
}

/**
 * Obtener el conteo de likes de una publicación
 */
export async function getPublicationLikesCount(cod_pub: number) {
    try {
        const result = await prisma.$queryRaw`
      SELECT COUNT(*)::INTEGER as total_likes 
      FROM me_gusta 
      WHERE cod_pub = ${cod_pub}::INTEGER
    ` as any[];

        return { success: true, count: result[0]?.total_likes || 0 };
    } catch (err) {
        console.error("Error en getPublicationLikesCount:", err);
        throw new Error((err as Error).message);
    }
}
