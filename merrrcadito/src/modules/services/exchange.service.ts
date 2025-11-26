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

// Crear un nuevo intercambio (Oferta Abierta con creación de producto).
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
            // NOTA: Se eliminan fecha_inter y estado_inter porque no existen en la tabla
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
                    NULL,
                    ${data.cod_us_1}, 
                    0,
                    NULL,
                    ${data.cant_prod_origen},
                    ${data.unidad_medida_origen},
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
                    NULL,
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
        console.log(`Consultando intercambios para usuario ${cod_us} (v3 - con historial rechazado)`);

        const exchanges: any[] = await prisma.$queryRaw`
            SELECT DISTINCT ON (i.cod_inter, COALESCE(ip.estado_inter::text, 'pendiente'))
                i.cod_inter,
                i.cod_us_1,
                i.cod_us_2,
                u2.nom_us || ' ' || u2.ap_pat_us || COALESCE(' ' || u2.ap_mat_us, '') as nombre_usuario_2,
                u2.handle_name as handle_name_2,
                i.cant_prod_origen,
                i.unidad_medida_origen,
                i.cant_prod_destino,
                i.unidad_medida_destino,
                i.impacto_amb_inter,
                i.foto_inter,
                COALESCE(ip.estado_inter::text, i.estado_inter::text) as estado_inter,
                ip.fecha_inter,
                ip.cod_prod_origen,
                p1.nom_prod as nombre_prod_origen,
                ip.cod_prod_destino,
                p2.nom_prod as nombre_prod_destino
            FROM intercambio i
            LEFT JOIN usuario u2 ON i.cod_us_2 = u2.cod_us
            LEFT JOIN intercambio_producto ip ON i.cod_inter = ip.cod_inter
            LEFT JOIN producto p1 ON ip.cod_prod_origen = p1.cod_prod
            LEFT JOIN producto p2 ON ip.cod_prod_destino = p2.cod_prod
            WHERE i.cod_us_1 = ${cod_us} 
               OR ip.cod_us_origen = ${cod_us}
            ORDER BY i.cod_inter DESC, COALESCE(ip.estado_inter::text, 'pendiente'), ip.fecha_inter DESC
        `;

        // Procesar resultados para manejar nulos y formatos
        const processedExchanges = exchanges.map(ex => {
            // Manejo de fecha
            let fecha = new Date();
            if (ex.fecha_inter) {
                fecha = new Date(ex.fecha_inter);
            }

            // Manejo de usuario 2 (si es nulo, mostrar "Pendiente" o el mismo usuario si es oferta abierta)
            const nombre_usuario_2 = ex.nombre_usuario_2 || 'Usuario';
            const handle_name_2 = ex.handle_name_2 || 'pendiente';

            // Manejo de producto destino
            const nombre_prod_destino = ex.nombre_prod_destino || 'Por definir';

            return {
                ...ex,
                tiene_foto: ex.foto_inter !== null && ex.foto_inter !== undefined,
                foto_inter: undefined, // No enviar el bytea completo al frontend
                fecha_inter: fecha.toISOString(),
                estado_inter: ex.estado_inter || 'pendiente',
                nombre_usuario_2,
                handle_name_2,
                nombre_prod_destino
            };
        });

        console.log('Intercambios procesados:', processedExchanges.map(ex => ({
            cod_inter: ex.cod_inter,
            fecha: ex.fecha_inter,
            usuario2: ex.handle_name_2
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

// Proponer un producto para un intercambio existente
export async function proposeExchange(data: {
    cod_inter: number;
    cod_us_2: number;
    nom_prod: string;
    peso_prod: number;
    marca_prod: string;
    cod_subcat_prod: number;
    calidad_prod: string;
    desc_prod: string;
    cant_prod_destino: number;
    unidad_medida_destino: string;
    foto_prod?: Buffer;
}) {
    try {
        console.log('Proponiendo producto para intercambio:', data.cod_inter);

        return await prisma.$transaction(async (tx) => {
            // 1. Verificar que el intercambio existe
            const intercambioData: any[] = await tx.$queryRaw`
                SELECT cod_inter, cod_us_1, cod_us_2
                FROM intercambio
                WHERE cod_inter = ${data.cod_inter}
            `;

            if (!intercambioData || intercambioData.length === 0) {
                throw new Error('Intercambio no encontrado.');
            }

            const intercambio = intercambioData[0];

            // 2. Validar que el usuario no esté proponiendo a su propio intercambio
            if (intercambio.cod_us_2 === data.cod_us_2) {
                throw new Error('No puedes proponer un producto a tu propio intercambio.');
            }

            // 3. Validar que el intercambio esté disponible (cod_us_1 debe ser NULL)
            if (intercambio.cod_us_1 !== null) {
                throw new Error('Este intercambio ya tiene una propuesta activa.');
            }

            // 4. Crear el producto propuesto
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

            const cod_prod_propuesto = productoResult[0]?.cod_prod;

            if (!cod_prod_propuesto) {
                throw new Error('Error al crear el producto propuesto');
            }

            // 5. Actualizar intercambio: El que propone se convierte en el ORIGEN (cod_us_1)
            await tx.$queryRaw`
                UPDATE intercambio
                SET cod_us_1 = ${data.cod_us_2},
                    cant_prod_origen = ${data.cant_prod_destino},
                    unidad_medida_origen = ${data.unidad_medida_destino},
                    estado_inter = 'pendiente'::"ExchangeState"
                WHERE cod_inter = ${data.cod_inter}
            `;

            console.log('Datos recibidos en proposeExchange:', data);

            console.log('Actualizando intercambio_producto para cod_inter:', data.cod_inter);

            // 6. Actualizar intercambio_producto: El producto propuesto se asigna al ORIGEN
            // Y registramos al usuario origen en la tabla de relación también
            await tx.$queryRaw`
                UPDATE intercambio_producto
                SET cod_prod_origen = ${cod_prod_propuesto},
                    cod_us_origen = ${data.cod_us_2}
                WHERE cod_inter = ${data.cod_inter} 
                  AND cod_prod_origen IS NULL
            `;

            console.log(`Propuesta creada para intercambio ${data.cod_inter}, producto: ${cod_prod_propuesto}`);

            return {
                success: true,
                message: 'Propuesta de intercambio enviada exitosamente',
                data: {
                    cod_inter: data.cod_inter,
                    cod_prod_propuesto
                }
            };
        });

    } catch (err) {
        console.error('Error en proposeExchange:', err);
        throw new Error((err as Error).message);
    }
}

// Obtener todos los intercambios abiertos (donde cod_us_1 === cod_us_2)
export async function get_all_open_exchanges() {
    const MAX_RETRIES = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`Obteniendo intercambios abiertos (intento ${attempt}/${MAX_RETRIES})...`);

            const exchanges: any[] = await prisma.$queryRaw`
                SELECT 
                    i.cod_inter,
                    i.cod_us_1,
                    i.cod_us_2,
                    i.cant_prod_destino as cant_prod_origen,
                    i.unidad_medida_destino as unidad_medida_origen,
                    i.impacto_amb_inter,
                    i.foto_inter,
                    ip.fecha_inter,
                    ip.estado_inter,
                    p_destino.nom_prod as nombre_prod_origen,
                    p_destino.desc_prod as desc_prod,
                    u2.nom_us || ' ' || u2.ap_pat_us as nombre_usuario_1,
                    u2.handle_name as handle_name_1
                FROM intercambio i
                INNER JOIN intercambio_producto ip ON i.cod_inter = ip.cod_inter
                LEFT JOIN producto p_destino ON ip.cod_prod_destino = p_destino.cod_prod
                LEFT JOIN usuario u2 ON i.cod_us_2 = u2.cod_us
                WHERE i.cod_us_1 IS NULL
                ORDER BY ip.fecha_inter DESC
            `;

            const uniqueExchanges = exchanges.filter((ex, index, self) =>
                index === self.findIndex((t) => (
                    t.cod_inter === ex.cod_inter
                ))
            );

            const processedExchanges = uniqueExchanges.map(ex => ({
                cod_inter: ex.cod_inter,
                cod_us_1: ex.cod_us_1,
                cod_us_2: ex.cod_us_2,
                nombre_prod_origen: ex.nombre_prod_origen,
                desc_prod: ex.desc_prod,
                nombre_usuario_1: ex.nombre_usuario_1,
                handle_name_1: ex.handle_name_1,
                cant_prod_origen: ex.cant_prod_origen,
                unidad_medida_origen: ex.unidad_medida_origen,
                impacto_amb_inter: Number(ex.impacto_amb_inter || 0),
                tiene_foto: ex.foto_inter !== null && ex.foto_inter !== undefined,
                fecha_inter: ex.fecha_inter ? new Date(ex.fecha_inter).toISOString() : new Date().toISOString(),
                estado_inter: ex.estado_inter || 'no_satisfactorio'
            }));

            console.log(`✅ Encontrados ${processedExchanges.length} intercambios abiertos`);
            return processedExchanges;

        } catch (err: any) {
            lastError = err;
            console.error(`❌ Error en intento ${attempt}/${MAX_RETRIES}:`, err.message);

            if (attempt < MAX_RETRIES) {
                const delay = attempt * 1000; // 1s, 2s
                console.log(`⏳ Reintentando en ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.error('❌ Todos los intentos fallaron');
    throw new Error(lastError?.message || 'Error al obtener intercambios después de varios intentos');
}

// Obtener solicitudes de intercambio pendientes (para el usuario destino/ofertante)
export async function get_pending_exchange_requests(cod_us: number) {
    try {
        console.log(`Obteniendo solicitudes pendientes para usuario ${cod_us}`);

        const pendingRequests: any[] = await prisma.$queryRaw`
            SELECT DISTINCT ON (i.cod_inter)
                i.cod_inter,
                i.cod_us_1,
                i.cod_us_2,
                i.cant_prod_origen,
                i.unidad_medida_origen,
                i.cant_prod_destino,
                i.unidad_medida_destino,
                i.impacto_amb_inter,
                i.foto_inter,
                i.estado_inter,
                u1.nom_us || ' ' || u1.ap_pat_us || COALESCE(' ' || u1.ap_mat_us, '') as nombre_usuario_origen,
                u1.handle_name as handle_name_origen,
                p_origen.nom_prod as nombre_prod_origen,
                p_destino.nom_prod as nombre_prod_destino,
                ip.fecha_inter
            FROM intercambio i
            INNER JOIN usuario u1 ON i.cod_us_1 = u1.cod_us
            INNER JOIN intercambio_producto ip ON i.cod_inter = ip.cod_inter
            LEFT JOIN producto p_origen ON ip.cod_prod_origen = p_origen.cod_prod
            LEFT JOIN producto p_destino ON ip.cod_prod_destino = p_destino.cod_prod
            WHERE i.cod_us_2 = ${cod_us} 
            AND i.estado_inter = 'pendiente'
            ORDER BY i.cod_inter, ip.fecha_inter DESC
        `;

        const processedRequests = pendingRequests.map(req => ({
            ...req,
            tiene_foto: req.foto_inter !== null && req.foto_inter !== undefined,
            foto_inter: undefined,
            fecha_inter: req.fecha_inter ? new Date(req.fecha_inter).toISOString() : new Date().toISOString()
        }));

        console.log(`✅ Encontradas ${processedRequests.length} solicitudes pendientes`);
        return processedRequests;
    } catch (err) {
        console.error('Error en get_pending_exchange_requests:', err);
        throw new Error((err as Error).message);
    }
}

// Aceptar una propuesta de intercambio
export async function accept_exchange_proposal(cod_inter: number, cod_us: number) {
    try {
        console.log(`Usuario ${cod_us} aceptando propuesta de intercambio ${cod_inter}`);

        return await prisma.$transaction(async (tx) => {
            // 1. Verificar que el intercambio existe y está pendiente
            const intercambioData: any[] = await tx.$queryRaw`
                SELECT cod_inter, cod_us_2, estado_inter
                FROM intercambio
                WHERE cod_inter = ${cod_inter}
            `;

            if (!intercambioData || intercambioData.length === 0) {
                throw new Error('Intercambio no encontrado.');
            }

            const intercambio = intercambioData[0];

            // 2. Validar que solo el usuario destino puede aceptar
            if (intercambio.cod_us_2 !== cod_us) {
                throw new Error('No tienes permiso para aceptar esta propuesta.');
            }

            // 3. Validar que el estado sea pendiente
            if (intercambio.estado_inter !== 'pendiente') {
                throw new Error('Esta propuesta no está pendiente.');
            }

            // 4. Actualizar estado a satisfactorio
            await tx.$queryRaw`
                UPDATE intercambio
                SET estado_inter = 'satisfactorio'::"ExchangeState"
                WHERE cod_inter = ${cod_inter}
            `;

            // 5. Actualizar estado en intercambio_producto
            await tx.$queryRaw`
                UPDATE intercambio_producto
                SET estado_inter = 'satisfactorio'::"TransactionState"
                WHERE cod_inter = ${cod_inter} AND cod_prod_origen IS NOT NULL
            `;

            console.log(`✅ Propuesta ${cod_inter} aceptada exitosamente`);

            return {
                success: true,
                message: 'Propuesta de intercambio aceptada exitosamente'
            };
        });
    } catch (err) {
        console.error('Error en accept_exchange_proposal:', err);
        throw new Error((err as Error).message);
    }
}

// Rechazar una propuesta de intercambio y volver a estado abierto
export async function reject_exchange_proposal(cod_inter: number, cod_us: number) {
    try {
        console.log(`Usuario ${cod_us} rechazando propuesta de intercambio ${cod_inter}`);

        return await prisma.$transaction(async (tx) => {
            // 1. Verificar que el intercambio existe y está pendiente
            const intercambioData: any[] = await tx.$queryRaw`
                SELECT cod_inter, cod_us_1, cod_us_2, estado_inter
                FROM intercambio
                WHERE cod_inter = ${cod_inter}
            `;

            if (!intercambioData || intercambioData.length === 0) {
                throw new Error('Intercambio no encontrado.');
            }

            const intercambio = intercambioData[0];

            // 2. Validar que solo el usuario destino puede rechazar
            if (intercambio.cod_us_2 !== cod_us) {
                throw new Error('No tienes permiso para rechazar esta propuesta.');
            }

            // 3. Validar que el estado sea pendiente
            if (intercambio.estado_inter !== 'pendiente') {
                throw new Error('Esta propuesta no está pendiente.');
            }

            // 4. Marcar en historial como rechazado (se mantiene en intercambio_producto)
            // IMPORTANTE: Guardamos el usuario origen en cod_us_origen para que le aparezca en su historial
            await tx.$queryRaw`
                UPDATE intercambio_producto
                SET estado_inter = 'no_satisfactorio'::"TransactionState",
                    cod_us_origen = ${intercambio.cod_us_1}
                WHERE cod_inter = ${cod_inter} AND cod_prod_origen IS NOT NULL
            `;

            // 5. Resetear intercambio a estado abierto (vuelve a estar disponible)
            await tx.$queryRaw`
                UPDATE intercambio
                SET cod_us_1 = NULL,
                    cant_prod_origen = 0,
                    unidad_medida_origen = NULL,
                    estado_inter = 'pendiente'::"ExchangeState"
                WHERE cod_inter = ${cod_inter}
            `;

            // 6. Crear NUEVA fila en intercambio_producto para el estado abierto
            // Necesitamos saber el producto destino original
            const prodDestinoData: any[] = await tx.$queryRaw`
                SELECT cod_prod_destino 
                FROM intercambio_producto 
                WHERE cod_inter = ${cod_inter} 
                LIMIT 1
            `;
            const cod_prod_destino = prodDestinoData[0]?.cod_prod_destino;

            await tx.$queryRaw`
                INSERT INTO intercambio_producto (
                    cod_inter,
                    cod_prod_origen,
                    cod_prod_destino,
                    estado_inter,
                    cod_us_origen
                ) VALUES (
                    ${cod_inter},
                    NULL,
                    ${cod_prod_destino},
                    NULL,
                    NULL
                )
            `;

            console.log(`✅ Propuesta ${cod_inter} rechazada (historial guardado) y vuelta a estado abierto`);

            return {
                success: true,
                message: 'Propuesta rechazada. El intercambio vuelve a estar disponible.'
            };
        });
    } catch (err) {
        console.error('Error en reject_exchange_proposal:', err);
        throw new Error((err as Error).message);
    }
}
