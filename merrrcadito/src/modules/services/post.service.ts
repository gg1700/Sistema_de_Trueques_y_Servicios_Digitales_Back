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
        await prisma.$queryRaw`
            SELECT sp_crearpublicacion(
                ${cod_us}::INTEGER,
                ${image_buffer ?? null}::BYTEA,
                ${current_post.estado_pub}::"PublicationState",
                ${current_post.contenido ?? null}::VARCHAR,
                ${cod_prod}::INTEGER,
                ${current_post.cant_prod}::DECIMAL,
                ${current_post.unidad_medida}::VARCHAR
            )
        `;
        return { success: true, message: "Publicación creada correctamente" };
    } catch (err) {
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