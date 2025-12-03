import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugStats() {
    const cod_us = 1; // Asumo que eres el usuario 1, o el que estás usando. Si sabes tu ID, mejor.
    // Voy a buscar el usuario por handle si es posible, o usaré 1 para probar.
    // Mejor busquemos un usuario que tenga transacciones.

    console.log("--- DEBUGGING STATS ---");

    // 1. Buscar la transacción específica 928
    const transactions: any[] = await prisma.$queryRaw`
        SELECT t.cod_trans, t.cod_us_origen, t.cod_us_destino, t.cod_pub, t.estado_trans, t.fecha_trans
        FROM transaccion t
        WHERE t.cod_trans = 928
    `;
    console.log("Transacción 928:", transactions);

    if (transactions.length === 0) {
        console.log("No se encontró la transacción 928.");
        // Fallback: ver las últimas 5 transacciones
        const lastTrans: any[] = await prisma.$queryRaw`SELECT * FROM transaccion ORDER BY cod_trans DESC LIMIT 5`;
        console.log("Últimas 5 transacciones:", lastTrans);
        return;
    }

    const cod_us_real = transactions[0].cod_us_origen;
    console.log(`Usando cod_us: ${cod_us_real}`);

    // 2. Ver detalles de las publicaciones compradas
    for (const t of transactions) {
        if (t.cod_pub) {
            const pub: any[] = await prisma.$queryRaw`
                SELECT p.cod_pub, p.impacto_amb_pub, p.estado_pub
                FROM publicacion p
                WHERE p.cod_pub = ${t.cod_pub}
            `;
            console.log(`Publicacion ${t.cod_pub}:`, pub[0]);

            // Verificar si está en publicacion_producto
            const pubProd: any[] = await prisma.$queryRaw`
                SELECT * FROM publicacion_producto WHERE cod_pub = ${t.cod_pub}
            `;
            console.log(`Es producto? ${pubProd.length > 0}`);
        }
    }

    // 3. Ejecutar la consulta exacta que falla
    const queryResult: any[] = await prisma.$queryRaw`
        SELECT COALESCE(AVG(CAST(p.impacto_amb_pub AS DECIMAL)), 0) as promedio
        FROM transaccion t
        INNER JOIN publicacion p ON t.cod_pub = p.cod_pub
        INNER JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
        WHERE t.cod_us_origen = ${cod_us_real}
        AND t.estado_trans = 'satisfactorio'::"TransactionState" -- Probando cast explícito
    `;
    console.log("Resultado Query Original (con cast):", queryResult);

    // 4. Query sin el filtro de estado para ver si es eso
    const queryNoStatus: any[] = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM transaccion t
        INNER JOIN publicacion p ON t.cod_pub = p.cod_pub
        INNER JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
        WHERE t.cod_us_origen = ${cod_us_real}
    `;
    console.log("Conteo sin filtro de estado:", queryNoStatus);
}

debugStats()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
