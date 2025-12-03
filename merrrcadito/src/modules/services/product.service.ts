import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductInfo {
    nom_prod: string,
    peso_prod: number,
    calidad_prod: 'usado' | 'nuevo',
    estado_prod: 'disponible' | 'agotado',
    precio_prod: number,
    marca_prod: string | null,
    desc_prod: string | null,
    cod_mat?: number // Added for CO2 calculation
}

export async function register_product(cod_subcat_prod: string, attributes: Partial<ProductInfo>) {
    try {
        console.log("[PRODUCT SERVICE] Registering product with attributes:", attributes);
        if (attributes.estado_prod === null || attributes.estado_prod === undefined) {
            attributes.estado_prod = 'disponible';
        }
        if (attributes.calidad_prod === null || attributes.calidad_prod === undefined) {
            attributes.calidad_prod = 'nuevo';
        }

        // 1. Register product
        const prod = await prisma.$queryRaw`
            SELECT sp_registrarproducto(
                ${cod_subcat_prod}::INTEGER,
                ${attributes.nom_prod}::VARCHAR,
                ${attributes.peso_prod}::DECIMAL,
                ${attributes.calidad_prod}::"ProductQuality",
                ${attributes.estado_prod}::"ProductState",
                ${attributes.precio_prod}::DECIMAL,
                ${attributes.marca_prod ?? null}::VARCHAR,
                ${attributes.desc_prod ?? null}::VARCHAR
            ) AS cod_prod
        `;
        const [ans] = prod as any[];
        console.log("Respuesta DB registrar producto:", ans);
        const cod_prod = ans.cod_prod || ans.sp_registrarproducto;

        // 2. Link material if provided (Critical for CO2 calculation)
        if (attributes.cod_mat) {
            console.log(`Linking product ${cod_prod} with material ${attributes.cod_mat}`);
            await prisma.$executeRaw`
                INSERT INTO material_producto (cod_mat, cod_prod)
                VALUES (${attributes.cod_mat}::INTEGER, ${cod_prod}::INTEGER)
                ON CONFLICT (cod_mat, cod_prod) DO NOTHING
            `;
        }

        return { success: true, message: "Producto registrado correctamente", cod_prod: cod_prod };
    } catch (err) {
        console.error("Error registering product:", err);
        throw new Error((err as Error).message);
    }
}