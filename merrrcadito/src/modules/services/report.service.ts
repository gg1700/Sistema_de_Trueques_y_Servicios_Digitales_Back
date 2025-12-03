import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtener estadísticas de crecimiento de usuarios por mes para un año específico
 */
export async function getUserGrowthStats(year: string) {
    try {
        console.log(`[REPORT SERVICE] Getting user growth stats for year: ${year}`);
        const stats = await prisma.$queryRaw`
            SELECT 
                EXTRACT(MONTH FROM fecha_registro) as mes,
                COUNT(*)::INTEGER as cantidad
            FROM detalle_usuario
            WHERE EXTRACT(YEAR FROM fecha_registro) = ${parseInt(year)}
            GROUP BY mes
            ORDER BY mes
        ` as any[];

        console.log('[REPORT SERVICE] Raw user growth stats:', stats);

        // Formatear para asegurar que todos los meses estén presentes
        const formattedStats = Array.from({ length: 12 }, (_, i) => {
            const monthData = stats.find((s: any) => s.mes === i + 1);
            return {
                mes: i + 1,
                cantidad: monthData ? Number(monthData.cantidad) : 0
            };
        });

        return formattedStats;
    } catch (err) {
        console.error('Error en getUserGrowthStats:', err);
        throw new Error('Error al obtener estadísticas de crecimiento de usuarios');
    }
}

/**
 * Obtener estadísticas de impacto ambiental por mes
 */
export async function getImpactStats(year: string) {
    try {
        console.log(`[REPORT SERVICE] Getting impact stats for year: ${year}`);

        // Impacto de compras (transacciones de publicaciones)
        const purchaseImpact = await prisma.$queryRaw`
            SELECT 
                EXTRACT(MONTH FROM t.fecha_trans) as mes,
                SUM(p.impacto_amb_pub)::DECIMAL as impacto
            FROM transaccion t
            INNER JOIN publicacion p ON t.cod_pub = p.cod_pub
            WHERE EXTRACT(YEAR FROM t.fecha_trans) = ${parseInt(year)}
            -- AND t.estado_trans = 'satisfactorio' -- Comentado temporalmente para debug
            GROUP BY mes
        ` as any[];

        // Impacto de intercambios
        // Usamos DISTINCT ON para evitar contar múltiples veces el impacto de un mismo intercambio
        // si hay múltiples productos en intercambio_producto
        const exchangeImpact = await prisma.$queryRaw`
            SELECT 
                EXTRACT(MONTH FROM fecha_inter) as mes,
                SUM(impacto_amb_inter)::DECIMAL as impacto
            FROM (
                SELECT DISTINCT ON (i.cod_inter)
                    i.cod_inter,
                    i.impacto_amb_inter,
                    ip.fecha_inter
                FROM intercambio i
                JOIN intercambio_producto ip ON i.cod_inter = ip.cod_inter
                WHERE EXTRACT(YEAR FROM ip.fecha_inter) = ${parseInt(year)}
            ) unique_exchanges
            GROUP BY mes
        ` as any[];

        console.log('[REPORT SERVICE] Raw purchase impact:', purchaseImpact);
        console.log('[REPORT SERVICE] Raw exchange impact:', exchangeImpact);

        const formattedStats = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const pImpact = purchaseImpact.find((s: any) => s.mes === month);
            const eImpact = exchangeImpact.find((s: any) => s.mes === month);

            return {
                mes: month,
                impacto_compras: pImpact ? Number(pImpact.impacto) : 0,
                impacto_intercambios: eImpact ? Number(eImpact.impacto) : 0,
                total: (pImpact ? Number(pImpact.impacto) : 0) + (eImpact ? Number(eImpact.impacto) : 0)
            };
        });

        return formattedStats;
    } catch (err) {
        console.error('Error en getImpactStats:', err);
        throw new Error('Error al obtener estadísticas de impacto ambiental');
    }
}

/**
 * Obtener volumen de transacciones (Tokens vs Productos)
 */
export async function getTransactionVolumeStats(year: string) {
    try {
        console.log(`[REPORT SERVICE] Getting transaction volume stats for year: ${year}`);
        const stats = await prisma.$queryRaw`
            SELECT 
                EXTRACT(MONTH FROM fecha_trans) as mes,
                SUM(CASE WHEN id_token IS NOT NULL THEN 1 ELSE 0 END)::INTEGER as compras_tokens,
                SUM(CASE WHEN cod_pub IS NOT NULL THEN 1 ELSE 0 END)::INTEGER as compras_productos
            FROM transaccion
            WHERE EXTRACT(YEAR FROM fecha_trans) = ${parseInt(year)}
            -- AND estado_trans = 'satisfactorio' -- Comentado temporalmente para debug
            GROUP BY mes
            ORDER BY mes
        ` as any[];

        console.log('[REPORT SERVICE] Raw transaction volume stats:', stats);

        const formattedStats = Array.from({ length: 12 }, (_, i) => {
            const monthData = stats.find((s: any) => s.mes === i + 1);
            return {
                mes: i + 1,
                compras_tokens: monthData ? Number(monthData.compras_tokens) : 0,
                compras_productos: monthData ? Number(monthData.compras_productos) : 0
            };
        });

        return formattedStats;
    } catch (err) {
        console.error('Error en getTransactionVolumeStats:', err);
        throw new Error('Error al obtener estadísticas de volumen de transacciones');
    }
}
