import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreatePromotionDTO {
  titulo_prom: string;
  fecha_ini_prom: string;
  fecha_fin_prom: string;
  descr_prom: string;
  banner_prom: Buffer; // Buffer directo de Multer
  descuento_prom: number;
}

interface LinkPromotionDTO {
  cod_prom: number;
  cod_pub: number;
  cod_us: number;
}

/**
 * Crear una nueva promoción
 */
export async function createPromotion(data: CreatePromotionDTO) {
  try {
    // Calcular duración en días
    const fechaIni = new Date(data.fecha_ini_prom);
    const fechaFin = new Date(data.fecha_fin_prom);
    const duracionDias = Math.ceil((fechaFin.getTime() - fechaIni.getTime()) / (1000 * 60 * 60 * 24));

    const result = await prisma.$queryRaw`
      INSERT INTO promocion (
        titulo_prom, 
        fecha_ini_prom, 
        duracion_prom,
        fecha_fin_prom, 
        descr_prom, 
        banner_prom, 
        descuento_prom
      ) VALUES (
        ${data.titulo_prom},
        ${data.fecha_ini_prom}::timestamp,
        ${duracionDias}::integer,
        ${data.fecha_fin_prom}::timestamp,
        ${data.descr_prom},
        ${data.banner_prom},
        ${data.descuento_prom}::numeric
      ) RETURNING cod_prom
    ` as any[];

    return {
      success: true,
      message: 'Promoción creada exitosamente',
      cod_prom: result[0].cod_prom
    };
  } catch (err) {
    console.error('Error en createPromotion:', err);
    throw new Error('Error al crear la promoción: ' + (err as Error).message);
  }
}

/**
 * Vincular una promoción a una publicación
 */
export async function linkPromotionToPublication(data: LinkPromotionDTO) {
  try {
    // 1. Verificar que la publicación pertenece al usuario
    const ownership = await prisma.$queryRaw`
      SELECT cod_us FROM publicacion WHERE cod_pub = ${data.cod_pub}
    ` as any[];

    if (!ownership.length) {
      throw new Error('La publicación no existe');
    }

    if (ownership[0].cod_us !== data.cod_us) {
      throw new Error('No tienes permiso para vincular esta publicación');
    }

    // 2. Verificar que la promoción existe y está vigente
    const promotion = await prisma.$queryRaw`
      SELECT cod_prom, titulo_prom FROM promocion 
      WHERE cod_prom = ${data.cod_prom} 
        AND fecha_ini_prom <= NOW() 
        AND fecha_fin_prom >= NOW()
    ` as any[];

    if (!promotion.length) {
      throw new Error('La promoción no existe o no está vigente');
    }

    // 3. Verificar que la publicación está activa
    const publicationStatus = await prisma.$queryRaw`
      SELECT estado_pub FROM publicacion WHERE cod_pub = ${data.cod_pub}
    ` as any[];

    if (publicationStatus[0].estado_pub !== 'activo') {
      throw new Error('Solo se pueden vincular promociones a publicaciones activas');
    }

    // 4. Vincular (ON CONFLICT evita duplicados)
    await prisma.$executeRaw`
      INSERT INTO publicacion_promocion (cod_pub, cod_prom)
      VALUES (${data.cod_pub}, ${data.cod_prom})
      ON CONFLICT (cod_pub, cod_prom) DO NOTHING
    `;

    return {
      success: true,
      message: 'Promoción vinculada exitosamente a la publicación'
    };
  } catch (err) {
    console.error('Error en linkPromotionToPublication:', err);
    throw new Error((err as Error).message);
  }
}

/**
 * Desvincular una promoción de una publicación
 */
export async function unlinkPromotionFromPublication(data: LinkPromotionDTO) {
  try {
    // Verificar propiedad antes de eliminar
    const ownership = await prisma.$queryRaw`
      SELECT cod_us FROM publicacion WHERE cod_pub = ${data.cod_pub}
    ` as any[];

    if (!ownership.length || ownership[0].cod_us !== data.cod_us) {
      throw new Error('No tienes permiso para desvincular esta publicación');
    }

    const result = await prisma.$executeRaw`
      DELETE FROM publicacion_promocion
      WHERE cod_pub = ${data.cod_pub} 
        AND cod_prom = ${data.cod_prom}
    `;

    if (result === 0) {
      throw new Error('La vinculación no existe');
    }

    return {
      success: true,
      message: 'Promoción desvinculada exitosamente'
    };
  } catch (err) {
    console.error('Error en unlinkPromotionFromPublication:', err);
    throw new Error((err as Error).message);
  }
}

/**
 * Obtener todas las promociones activas (vigentes)
 */
export async function getActivePromotions() {
  try {
    const promotions = await prisma.$queryRaw`
      SELECT 
        cod_prom,
        titulo_prom,
        fecha_ini_prom,
        fecha_fin_prom,
        descr_prom,
        descuento_prom,
        duracion_prom,
        encode(banner_prom, 'base64') as banner_prom_base64
      FROM promocion
      WHERE fecha_ini_prom <= NOW() 
        AND fecha_fin_prom >= NOW()
      ORDER BY fecha_ini_prom DESC
    ` as any[];

    return promotions;
  } catch (err) {
    console.error('Error en getActivePromotions:', err);
    throw new Error('Error al obtener promociones activas: ' + (err as Error).message);
  }
}

/**
 * Obtener publicaciones vinculadas a una promoción específica
 */
export async function getPublicationsByPromotion(cod_prom: number) {
  try {
    const publications = await prisma.$queryRaw`
      SELECT 
        pub.cod_pub,
        pub.contenido,
        pub.fecha_ini_pub,
        pub.fecha_fin_pub,
        u.nom_us,
        u.handle_name,
        u.cod_us,
        prod.nom_prod,
        prod.precio_prod,
        pub_prod.cant_prod,
        (prod.precio_prod * pub_prod.cant_prod) as precio_total,
        (prod.precio_prod * pub_prod.cant_prod * (1 - prom.descuento_prom/100)) as precio_con_descuento,
        prom.descuento_prom
      FROM publicacion_promocion pp
      INNER JOIN publicacion pub ON pp.cod_pub = pub.cod_pub
      INNER JOIN usuario u ON pub.cod_us = u.cod_us
      INNER JOIN publicacion_producto pub_prod ON pub.cod_pub = pub_prod.cod_pub
      INNER JOIN producto prod ON pub_prod.cod_prod = prod.cod_prod
      INNER JOIN promocion prom ON pp.cod_prom = prom.cod_prom
      WHERE pp.cod_prom = ${cod_prom}
        AND pub.estado_pub = 'activo'
        AND prom.fecha_ini_prom <= NOW() 
        AND prom.fecha_fin_prom >= NOW()
      ORDER BY pub.fecha_ini_pub DESC
    ` as any[];

    return publications;
  } catch (err) {
    console.error('Error en getPublicationsByPromotion:', err);
    throw new Error('Error al obtener publicaciones de la promoción: ' + (err as Error).message);
  }
}

/**
 * Obtener promociones creadas por un usuario específico
 */
export async function getUserPromotions(cod_us: number) {
  try {
    const promotions = await prisma.$queryRaw`
      SELECT 
        p.cod_prom,
        p.titulo_prom,
        p.descr_prom,
        p.descuento_prom,
        p.fecha_ini_prom,
        p.fecha_fin_prom,
        p.duracion_prom,
        COUNT(DISTINCT pp.cod_pub) as publicaciones_vinculadas,
        CASE 
          WHEN p.fecha_ini_prom > NOW() THEN 'programada'
          WHEN p.fecha_fin_prom < NOW() THEN 'finalizada'
          ELSE 'activa'
        END as estado_promocion
      FROM promocion p
      LEFT JOIN publicacion_promocion pp ON p.cod_prom = pp.cod_prom
      LEFT JOIN publicacion pub ON pp.cod_pub = pub.cod_pub
      WHERE pub.cod_us = ${cod_us} OR p.cod_prom IN (
        SELECT DISTINCT prom.cod_prom 
        FROM promocion prom
        INNER JOIN publicacion_promocion pp2 ON prom.cod_prom = pp2.cod_prom
        INNER JOIN publicacion pub2 ON pp2.cod_pub = pub2.cod_pub
        WHERE pub2.cod_us = ${cod_us}
      )
      GROUP BY p.cod_prom
      ORDER BY p.fecha_ini_prom DESC
    ` as any[];

    return promotions;
  } catch (err) {
    console.error('Error en getUserPromotions:', err);
    throw new Error('Error al obtener promociones del usuario: ' + (err as Error).message);
  }
}

/**
 * Obtener el precio de una publicación (con descuento si aplica)
 */
export async function getPublicationPrice(cod_pub: number) {
  try {
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
    ` as any[];

    if (!price.length) {
      return null;
    }

    // Convertir BigInt/Decimal a Number para JSON
    const result = price[0];
    return {
      precio_original: Number(result.precio_original),
      cant_prod: Number(result.cant_prod),
      descuento: Number(result.descuento),
      total_original: Number(result.total_original),
      total_con_descuento: Number(result.total_con_descuento),
      titulo_prom: result.titulo_prom,
      cod_prom: result.cod_prom,
      tiene_promocion: result.tiene_promocion
    };
  } catch (err) {
    console.error('Error en getPublicationPrice:', err);
    throw new Error('Error al obtener precio de la publicación: ' + (err as Error).message);
  }
}

/**
 * Obtener banner de una promoción
 */
export async function getPromotionBanner(cod_prom: number) {
  try {
    const result = await prisma.$queryRaw`
      SELECT banner_prom 
      FROM promocion 
      WHERE cod_prom = ${cod_prom}
    ` as any[];

    if (!result.length || !result[0].banner_prom) {
      return null;
    }

    return result[0].banner_prom;
  } catch (err) {
    console.error('Error en getPromotionBanner:', err);
    throw new Error('Error al obtener banner de la promoción: ' + (err as Error).message);
  }
}

/**
 * Helper function to convert BigInt to Number
 */
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }
  return obj;
}

/**
 * REPORTE: Rendimiento de Promociones
 * Llama al stored procedure sp_reporteRendimientoPromociones
 */
export async function get_promotion_performance_report(fecha_inicio: string, fecha_fin: string) {
  try {
    const report = await prisma.$queryRaw`
    SELECT * FROM sp_reporteRendimientoPromociones(
      ${fecha_inicio}:: TIMESTAMP,
      ${fecha_fin}:: TIMESTAMP
    )
      ` as any[];

    return convertBigIntToNumber(report);
  } catch (err) {
    console.error('Error en get_promotion_performance_report:', err);
    throw new Error('Error al obtener reporte de rendimiento de promociones: ' + (err as Error).message);
  }
}