import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateExchangeData {
    cod_us_1: number;
    nom_prod: string;
    peso_prod: number;
    marca_prod: string;
    cod_subcat_prod: number;
    calidad_prod: string;
    desc_prod: string;
    cant_prod_origen: number;
    unidad_medida_origen: string;
    foto_inter?: Buffer;
}

// Crear un nuevo intercambio (Oferta Abierta con creación de producto)
export async function create_exchange(data: CreateExchangeData) {
    try {
        console.log('Creando oferta de intercambio y producto:', data);

        return await prisma.$transaction(async (tx) => {
            // 1. Crear el producto
            const productoResult: any[] = await tx.$queryRaw`
                INSERT INTO producto (
                    nom_prod,
                    peso_prod,
                    marca_prod,
                    cod_subcat_prod,
                    calidad_prod,
                    desc_prod,
                    precio_prod,
                    estado_prod
                ) VALUES (
                    ${data.nom_prod},
                    ${data.peso_prod},
                    ${data.marca_prod},
                    ${data.cod_subcat_prod},
                    ${data.calidad_prod}::"ProductQuality",
                    ${data.desc_prod},
                    0,
                    'disponible'::"ProductState"
                )
                RETURNING cod_prod
            `;

            const cod_prod_nuevo = productoResult[0]?.cod_prod;

            if (!cod_prod_nuevo) {
                throw new Error('Error al crear el producto para el intercambio');
            }

            // 2. Calcular impacto ambiental
            const factor_base = 0.5;
            const impacto_amb_inter = Number((data.peso_prod * data.cant_prod_origen * factor_base).toFixed(2));

            // 3. Crear el intercambio (Oferta Abierta)
            const intercambioResult: any[] = await tx.$queryRaw`
                INSERT INTO intercambio (
                    cod_us_1,
                    cod_us_2,
                    cant_prod_origen,
                    unidad_medida_origen,
                    cant_prod_destino,
                    unidad_medida_destino,
                    foto_inter,
                    impacto_amb_inter
                ) VALUES (
                    ${data.cod_us_1},
                    ${data.cod_us_1}, 
                    ${data.cant_prod_origen},
                    ${data.unidad_medida_origen},
                    0,
                    'N/A',
                    ${data.foto_inter || null}::bytea,
                    ${impacto_amb_inter}
                )
                RETURNING cod_inter
            `;

            const cod_inter = intercambioResult[0]?.cod_inter;

            if (!cod_inter) {
                throw new Error('Error al crear el intercambio');
            }

            // 4. Crear la relación en intercambio_producto
            await tx.$queryRaw`
                INSERT INTO intercambio_producto (
                    cod_inter,
                    cod_prod_origen,
                    cod_prod_destino
                ) VALUES (
                    ${cod_inter},
                    ${cod_prod_nuevo},
                    ${cod_prod_nuevo}
                )
            `;

            console.log(`Oferta de intercambio creada: ${cod_inter}, Producto creado: ${cod_prod_nuevo}`);

            return {
                success: true,
                message: 'Oferta de intercambio publicada exitosamente',
                data: {
                    cod_inter,
                    cod_prod: cod_prod_nuevo,
                    impacto_amb_inter
                }
            };
        });

    } catch (err) {
        console.error('Error en create_exchange:', err);
        throw new Error((err as Error).message);
    }
}

// Calcular impacto ambiental del intercambio
async function calcular_impacto_intercambio(
    cod_prod_origen: number,
    cod_prod_destino: number,
    cant_origen: number,
    cant_destino: number
): Promise<number> {
    try {
        // Obtener peso e impacto de producto origen
        const prodOrigenResult: any[] = await prisma.$queryRaw`
            SELECT peso_prod FROM producto WHERE cod_prod = ${cod_prod_origen}
        `;
        const peso_origen = Number(prodOrigenResult[0]?.peso_prod || 0);

        // Obtener peso e impacto de producto destino
        const prodDestinoResult: any[] = await prisma.$queryRaw`
            SELECT peso_prod FROM producto WHERE cod_prod = ${cod_prod_destino}
        `;
        const peso_destino = Number(prodDestinoResult[0]?.peso_prod || 0);

        // Calcular el impacto total basado en peso y cantidad
        // Formula simple: promedio de pesos * cantidades * factor base
        const factor_base = 0.5; // Factor de impacto ambiental base para intercambios
        const impacto_origen = peso_origen * cant_origen * factor_base;
        const impacto_destino = peso_destino * cant_destino * factor_base;

        // El impacto del intercambio es el promedio de ambos
        const impacto_total = (impacto_origen + impacto_destino) / 2;

        console.log(`Impacto calculado: ${impacto_total.toFixed(2)}`);
        return Number(impacto_total.toFixed(2));
    } catch (err) {
        console.error('Error calculando impacto:', err);
        return 0;
    }
}

// Obtener intercambios de un usuario
export async function get_user_exchanges(cod_us: number) {
    try {
        const exchanges: any[] = await prisma.$queryRaw`
            SELECT 
                i.cod_inter,
                i.cod_us_1,
                i.cod_us_2,
                i.cant_prod_origen,
                i.unidad_medida_origen,
                i.impacto_amb_inter,
                i.foto_inter,
                p.nom_prod as nombre_prod_origen,
                p.desc_prod as descripcion_prod
            FROM intercambio i
            INNER JOIN intercambio_producto ip ON i.cod_inter = ip.cod_inter
            INNER JOIN producto p ON ip.cod_prod_origen = p.cod_prod
            WHERE i.cod_us_1 = ${cod_us}
            ORDER BY i.cod_inter DESC
        `;

        // Procesar resultados para agregar campo tiene_foto como booleano
        const processedExchanges = exchanges.map(ex => ({
            ...ex,
            tiene_foto: ex.foto_inter !== null && ex.foto_inter !== undefined,
            foto_inter: undefined // No enviar el bytea completo al frontend
        }));

        console.log('Intercambios procesados:', processedExchanges.map(ex => ({
            cod_inter: ex.cod_inter,
            tiene_foto: ex.tiene_foto,
            nombre: ex.nombre_prod_origen
        })));

        return processedExchanges;
    } catch (err) {
        console.error('Error en get_user_exchanges:', err);
        throw new Error((err as Error).message);
    }
}

// Obtener imagen de un intercambio
export async function get_exchange_image(cod_inter: number) {
    try {
        const result: any[] = await prisma.$queryRaw`
            SELECT foto_inter
            FROM intercambio
            WHERE cod_inter = ${cod_inter}
        `;

        if (result.length === 0 || !result[0].foto_inter) {
            return null;
        }

        return result[0].foto_inter;
    } catch (err) {
        console.error('Error en get_exchange_image:', err);
        throw new Error((err as Error).message);
    }
}
