import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PostInfo {
    estado_pub: 'activo' | 'inactivo',
    contenido: string | null,
    cant_prod: number,
    unidad_medida: string
}

export async function create_post(cod_us: string, cod_prod: string, current_post: Partial<PostInfo>, image_buffer: Buffer) {
    try {
        if (current_post.estado_pub === null || current_post.estado_pub === undefined) {
            current_post.estado_pub = 'activo';
        }

        console.log("=== CREATE POST SERVICE DEBUG ===");
        console.log("cod_us:", cod_us, "type:", typeof cod_us);
        console.log("cod_prod:", cod_prod, "type:", typeof cod_prod);
        console.log("current_post:", current_post);
        console.log("image_buffer length:", image_buffer?.length);

        const result: any[] = await prisma.$queryRaw`
            SELECT sp_crearpublicacion(
                ${cod_us}::INTEGER,
                ${image_buffer ?? null}::BYTEA,
                ${current_post.estado_pub}::"PublicationState",
                ${current_post.contenido ?? null}::VARCHAR,
                ${cod_prod}::INTEGER,
                ${current_post.cant_prod}::DECIMAL,
                ${current_post.unidad_medida}::VARCHAR
            ) as cod_pub
        `;

        const cod_pub = result[0]?.cod_pub || result[0]?.sp_crearpublicacion;

        // FORCE CO2 CALCULATION (Direct Update)
        if (cod_pub) {
            try {
                console.log(`[CO2 DEBUG] Starting calculation for cod_pub: ${cod_pub}, cod_prod: ${cod_prod}`);

                // 1. Get Product Weight
                const prodData: any[] = await prisma.$queryRaw`
                    SELECT peso_prod FROM producto WHERE cod_prod = ${cod_prod}::INTEGER
                `;
                const peso = Number(prodData[0]?.peso_prod || 0);
                console.log(`[CO2 DEBUG] Product Weight: ${peso}`);

                // 2. Get Material Factor
                const matData: any[] = await prisma.$queryRaw`
                    SELECT m.factor_co2, m.nom_mat
                    FROM material_producto mp
                    JOIN material m ON mp.cod_mat = m.cod_mat
                    WHERE mp.cod_prod = ${cod_prod}::INTEGER
                    LIMIT 1
                `;
                const factor = Number(matData[0]?.factor_co2 || 0);
                console.log(`[CO2 DEBUG] Material Factor: ${factor} (Material: ${matData[0]?.nom_mat || 'None'})`);

                // 3. Calculate Impact
                const cantidad = Number(current_post.cant_prod || 0);
                const impacto = peso * cantidad * factor;

                console.log(`[CO2 DEBUG] Calculation: ${peso} * ${cantidad} * ${factor} = ${impacto}`);

                // 4. Update Publication
                await prisma.$executeRaw`
                    UPDATE publicacion 
                    SET impacto_amb_pub = ${impacto}::DECIMAL
                    WHERE cod_pub = ${cod_pub}::INTEGER
                `;
            } catch (calcError) {
                console.error("Error calculating CO2 impact:", calcError);
                // Don't fail the whole request if calculation fails
            }
        }

        return { success: true, message: "Publicación creada correctamente", cod_pub };
    } catch (err) {
        console.error("=== ERROR EN CREATE POST SERVICE ===");
        console.error("Error completo:", err);
        console.error("Parámetros recibidos:", { cod_us, cod_prod, current_post });
        throw new Error((err as Error).message);
    }
}

export async function get_all_active_product_posts() {
    try {
        const posts = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerpublicacionesproducto()
        `;
        return posts;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_all_active_service_posts() {
    try {
        const posts = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerpublicacionesservicio()
        `;
        return posts;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_post_by_id(cod_pub: string) {
    try {
        const post = await prisma.$queryRaw`
            SELECT 
                p.cod_pub,
                p.contenido as titulo_pub
            FROM publicacion p
            WHERE p.cod_pub = ${cod_pub}::INTEGER
            LIMIT 1
        `;
        const postArray = post as any[];
        return postArray.length > 0 ? postArray[0] : null;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_all_posts_except_user(cod_us: number) {
    try {
        const posts = await prisma.$queryRaw`
            SELECT 
                p.cod_pub,
                p.fecha_ini_pub,
                p.foto_pub,
                p.calif_pond_pub,
                u.cod_us,
                u.handle_name as autor_handle,
                u.nom_us as autor_nombre,
                u.foto_us as autor_foto,
                COALESCE(prod.nom_prod, serv.nom_serv) as titulo,
                COALESCE(prod.desc_prod, serv.desc_serv) as descripcion,
                COALESCE(prod.precio_prod, serv.precio_serv) as precio,
                CASE 
                    WHEN prod.cod_prod IS NOT NULL THEN 'Producto'
                    WHEN serv.cod_serv IS NOT NULL THEN 'Servicio'
                END as tipo
            FROM publicacion p
            INNER JOIN usuario u ON p.cod_us = u.cod_us
            LEFT JOIN publicacion_producto pp ON p.cod_pub = pp.cod_pub
            LEFT JOIN producto prod ON pp.cod_prod = prod.cod_prod
            LEFT JOIN publicacion_servicio ps ON p.cod_pub = ps.cod_pub
            LEFT JOIN servicio serv ON ps.cod_serv = serv.cod_serv
            WHERE p.cod_us != ${cod_us}::INTEGER
            AND p.estado_pub = 'activo'
            ORDER BY p.fecha_ini_pub DESC
        ` as any[];
        return posts;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}