import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductInfo {
    nom_prod: string,
    peso_prod: number,
    calidad_prod: 'usado' | 'nuevo',
    estado_prod: 'disponible' | 'agotado',
    precio_prod: number,
    marca_prod: string | null,
    desc_prod: string | null
}

export async function register_product(cod_subcat_prod: string, attributes: Partial<ProductInfo>) {
    try{
        if(attributes.estado_prod !== null || attributes.estado_prod !== undefined){
            attributes.estado_prod = 'disponible';
        }
        if(attributes.calidad_prod !== null || attributes.calidad_prod !== undefined){
            attributes.calidad_prod = 'nuevo';
        }
        await prisma.$queryRaw`
            SELECT sp_registrarproducto(
                ${cod_subcat_prod}::INTEGER,
                ${attributes.nom_prod}::VARCHAR,
                ${attributes.peso_prod}::DECIMAL,
                ${attributes.calidad_prod}::"ProductQuality",
                ${attributes.estado_prod}::"ProductState",
                ${attributes.precio_prod}::DECIMAL,
                ${attributes.marca_prod ?? null}::VARCHAR,
                ${attributes.desc_prod ?? null}::VARCHAR
            )
        `;
        return { success: true, message: "Producto registrado correctamente" };
    }catch(err){
        throw new Error((err as Error).message);
    }
}