import { PrismaClient } from "@prisma/client";
import * as BinnacleService from './binnacle.service';

const prisma = new PrismaClient();

interface TransactionInfo {
    cod_potenciador: string | null,
    cod_pub: string | null,
    cod_evento: string | null,
    descr_trans: string | null,
    moneda: 'CV' | 'Bs',
    monto_regalo: number | null,
    id_token: string | null
}

export async function register_transaction(cod_us_origen: string, attributes: Partial<TransactionInfo>) {
    try {
        const exists_origin = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciacodusuario(${cod_us_origen}::INTEGER) AS result_origin
        `;
        const [ans] = exists_origin as any[];
        const { result_origin } = ans;
        if (!result_origin) {
            throw new Error('El código de usuario origen no existe.');
        }
        let estado_trans = null;
        let cod_us_destino = null;
        let trans_owner = null;
        let monto_pagado = null;
        let monto_pagado_bs = null;
        // Verificar si es una publicación o un evento
        if (attributes.cod_pub != null && attributes.cod_evento == null && attributes.id_token == null) {
            // Es una publicación
            const exists_pub = await prisma.$queryRaw`
                SELECT * FROM sp_verificarexistenciacodpublicacion(${attributes.cod_pub ?? null}::INTEGER) AS result_pub
            `;
            const [ans2] = exists_pub as any[];
            const { result_pub } = ans2;
            // Verificar si la publicación existe
            if (!result_pub) {
                throw new Error('El código de publicación no existe.');
            } else {
                // Obtener el dueño de la publicación (usuario destino)
                trans_owner = await prisma.$queryRaw`
                    SELECT cod_us FROM publicacion 
                    WHERE cod_pub = ${attributes.cod_pub}::INTEGER
                `;
                const [owner] = trans_owner as any[];
                const { cod_us } = owner;
                cod_us_destino = cod_us;

                // Verificar saldo del usuario origen
                const saldo_us_origen: any[] = await prisma.$queryRaw`
                    SELECT saldo_actual FROM billetera
                    WHERE cod_us = ${cod_us_origen}::INTEGER
                `;
                const [wallet_origin] = saldo_us_origen;
                const { saldo_actual } = wallet_origin;
                const monto = await prisma.$queryRaw`
                    SELECT prod.precio_prod, pub_prod.cant_prod FROM publicacion_producto AS pub_prod
                    JOIN producto AS prod ON pub_prod.cod_prod = prod.cod_prod
                    WHERE pub_prod.cod_pub = ${attributes.cod_pub}::INTEGER
                `;
                const [result]: any = monto;
                const { precio_prod, cant_prod } = result;
                const total_cost = precio_prod * cant_prod;

                // Determinar el estado de la transacción según el saldo del usuario origen y el costo total
                if (saldo_actual < total_cost) {
                    estado_trans = 'no_satisfactorio';
                } else {
                    monto_pagado = total_cost;
                    estado_trans = 'satisfactorio';
                    // Actualizar el saldo del usuario origen
                    await prisma.$queryRaw`
                        UPDATE billetera
                        SET saldo_actual = saldo_actual - ${total_cost}::DECIMAL
                        WHERE cod_us = ${cod_us_origen}::INTEGER
                    `;
                }
            }
        } else if (attributes.cod_evento != null && attributes.cod_pub == null && attributes.id_token == null) {
            // Es un evento
            const exists_event = await prisma.$queryRaw`
                SELECT * FROM sp_verificarexistenciacodevento(${attributes.cod_evento ?? null}::INTEGER) AS result_event
            `;
            const [ans2] = exists_event as any[];
            const { result_event } = ans2;
            // Verificar si el evento existe
            if (!result_event) {
                throw new Error('El código de evento no existe.');
            } else {
                // Obtener el dueño del evento (usuario destino)
                trans_owner = await prisma.$queryRaw`
                    SELECT cod_us FROM usuario_evento
                    WHERE cod_evento = ${attributes.cod_evento}::INTEGER
                `;
                const [owner] = trans_owner as any[];
                const { cod_us } = owner;
                cod_us_destino = cod_us;

                // Verificar saldo del usuario origen
                const saldo_us_origen: any[] = await prisma.$queryRaw`
                    SELECT saldo_actual FROM billetera
                    WHERE cod_us = ${cod_us_origen}::INTEGER
                `;
                const [wallet_origin] = saldo_us_origen;
                const { saldo_actual } = wallet_origin;
                const event_cost: any[] = await prisma.$queryRaw`
                    SELECT costo_inscripcion FROM evento
                    WHERE cod_evento = ${attributes.cod_evento}::INTEGER
                `;
                const [event] = event_cost;
                const { costo_inscripcion } = event;

                // Determinar el estado de la transacción según el saldo del usuario origen y el costo del evento
                if (saldo_actual < costo_inscripcion) {
                    estado_trans = 'no_satisfactorio';
                } else {
                    monto_pagado = costo_inscripcion;
                    estado_trans = 'satisfactorio';
                    // Actualizar el saldo del usuario origen
                    await prisma.$queryRaw`
                        UPDATE billetera
                        SET saldo_actual = saldo_actual - ${costo_inscripcion}::DECIMAL
                        WHERE cod_us = ${cod_us_origen}::INTEGER
                    `;
                }
            }
        } else if (attributes.id_token != null && attributes.cod_pub == null && attributes.cod_evento == null) {
            // Es la compra de un paquete de tokens
            const exists_token = await prisma.$queryRaw`
                SELECT * FROM sp_verificarexistenciapaquetetoken(${attributes.id_token ?? null}::INTEGER) AS result_token
            `;
            const [ans2] = exists_token as any[];
            const { result_token } = ans2;
            // Verificar si el paquete de tokens existe
            if (!result_token) {
                throw new Error('El codigo del paquete de token no existe.');
            } else {
                attributes.moneda = 'Bs';
                // Verificar saldo real del usuario (dinero)
                const saldo_us_origen: any[] = await prisma.$queryRaw`
                    SELECT saldo_real FROM billetera
                    WHERE cod_us = ${cod_us_origen}::INTEGER
                `;

                if (!saldo_us_origen || saldo_us_origen.length === 0) {
                    throw new Error('No se encontró la billetera del usuario.');
                }

                const [wallet_origin] = saldo_us_origen;
                const { saldo_real } = wallet_origin;

                if (saldo_real === null || saldo_real === undefined) {
                    throw new Error('El saldo real del usuario no está definido.');
                }

                // Obtener precio y tokens del paquete
                const token_package: any[] = await prisma.$queryRaw`
                    SELECT precio_real, tokens FROM paquete_token
                    WHERE id = ${attributes.id_token}::INTEGER
                `;

                if (!token_package || token_package.length === 0) {
                    throw new Error('No se encontraron los datos del paquete de tokens.');
                }

                const [package_data] = token_package;
                const { precio_real, tokens } = package_data;

                if (precio_real === null || precio_real === undefined) {
                    throw new Error('El precio del paquete no está definido.');
                }

                if (tokens === null || tokens === undefined) {
                    throw new Error('La cantidad de tokens del paquete no está definida.');
                }

                // Función helper para convertir a número
                const toNumber = (val: any): number => {
                    if (typeof val === 'number') return val;
                    if (typeof val === 'string') return parseFloat(val);
                    if (val && typeof val === 'object') {
                        // Si es un objeto Decimal de Prisma/Postgres
                        if (typeof val.toNumber === 'function') return val.toNumber();
                        if (val.toString) return parseFloat(val.toString());
                        // Intento final: convertir a string JSON y parsear si es necesario, o usar valueOf
                        return Number(val);
                    }
                    return 0;
                };

                // Convertir a números
                const saldo_real_num = toNumber(saldo_real);
                const precio_real_num = toNumber(precio_real);
                const tokens_num = toNumber(tokens);

                console.log(`[DEBUG] Usuario ${cod_us_origen}: saldo=${saldo_real_num} (orig:${typeof saldo_real}), precio=${precio_real_num} (orig:${typeof precio_real})`);

                // Determinar el estado de la transacción según el saldo real y el precio
                if (saldo_real_num < precio_real_num) {
                    estado_trans = 'no_satisfactorio';
                    console.log(`[DEBUG] Saldo insuficiente. Estado: ${estado_trans}`);
                } else {
                    monto_pagado_bs = precio_real_num;
                    estado_trans = 'satisfactorio';
                    console.log(`[DEBUG] Saldo suficiente. Actualizando billetera...`);
                    // Actualizar saldo real (descontar dinero) y saldo actual (agregar tokens)
                    await prisma.$queryRaw`
                        UPDATE billetera
                        SET saldo_real = saldo_real - ${precio_real_num}::DECIMAL,
                            saldo_actual = saldo_actual + ${tokens_num}::DECIMAL
                        WHERE cod_us = ${cod_us_origen}::INTEGER
                    `;
                    console.log(`[DEBUG] Billetera actualizada exitosamente`);
                }
            }
        } else {
            // Ni publicación ni evento proporcionado correctamente
            throw new Error('Debe proporcionar un código de publicación o un código de evento válido.');
        }

        // Validar que la transacción sea satisfactoria antes de registrarla
        if (estado_trans === 'no_satisfactorio') {
            throw new Error('Saldo insuficiente para completar la transacción.');
        }

        if (attributes.moneda === null || attributes.moneda === undefined) {
            attributes.moneda = 'CV';
        }
        const transaction = await prisma.$queryRaw`
            SELECT sp_registrartransaccion(
                ${attributes.cod_potenciador ?? null}::INTEGER,
                ${cod_us_origen}::INTEGER,
                ${cod_us_destino}::INTEGER,
                ${attributes.cod_pub ?? null}::INTEGER,
                ${attributes.cod_evento ?? null}::INTEGER,
                ${attributes.descr_trans ?? null}::VARCHAR,
                ${attributes.moneda}::"Currency",
                ${attributes.monto_regalo ?? null}::DECIMAL,
                ${estado_trans}::"TransactionState",
                ${attributes.id_token ?? null}::INTEGER
            ) AS cod_trans
        `;
        const [trans_cod]: any = transaction;
        const { cod_trans } = trans_cod;
        await prisma.$queryRaw`
            SELECT sp_registrarpagoescrow(
                ${cod_trans}::INTEGER,
                ${monto_pagado ?? null}::DECIMAL,
                ${monto_pagado_bs ?? null}::DECIMAL
            )
        `;
        const binnacle_result = await BinnacleService.register_transaction_binnacle(cod_trans);
        if (!binnacle_result.success) {
            return binnacle_result;
        }
        return { success: true, message: "Transacción registrada correctamente" };
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_user_transaction_history(cod_us: string) {
    try {
        const transaction_history: TransactionInfo[] = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerhistorialtransaccionesusuario(
                ${cod_us}::INTEGER
            )
        `;
        const filtered_transaction_history: TransactionInfo[] = []
        for (const transaction of transaction_history) {
            const filtered_transaction = Object.fromEntries(
                Object.entries(transaction).filter(([_, v]) => v !== null)
            ) as TransactionInfo;
            filtered_transaction_history.push(filtered_transaction);
        }
        return filtered_transaction_history;
    } catch (err) {
        throw new Error((err as Error).message)
    }
}

export async function get_complete_transaction_history_by_month(month: string) {
    try {
        const transaction_history: TransactionInfo[] = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerhistorialtransaccionescompletomes(
                ${month}::INTEGER
            )
        `;
        const filtered_transaction_history: TransactionInfo[] = []
        for (const transaction of transaction_history) {
            const filtered_transaction = Object.fromEntries(
                Object.entries(transaction).filter(([_, v]) => v !== null)
            ) as TransactionInfo;
            filtered_transaction_history.push(filtered_transaction);
        }
        return filtered_transaction_history;
    } catch (err) {
        throw new Error((err as Error).message)
    }
}

export async function getPendingCollections(cod_us: number) {
    try {
        // Consultar todos los escrows donde el usuario es el destino de la transacción
        const pendingCollections: any[] = await prisma.$queryRaw`
            SELECT 
                e.cod_escrow,
                e.monto_pagado,
                e.monto_comision,
                e.estado_escrow,
                t.cod_trans,
                t.fecha_trans,
                t.moneda,
                t.desc_trans,
                u_origen.nom_us,
                u_origen.ap_pat_us,
                u_origen.ap_mat_us,
                u_origen.handle_name as handle_origen,
                u_origen.foto_us as foto_origen
            FROM escrow e
            INNER JOIN transaccion t ON e.cod_trans = t.cod_trans
            INNER JOIN usuario u_origen ON t.cod_us_origen = u_origen.cod_us
            WHERE t.cod_us_destino = ${cod_us}
            ORDER BY t.fecha_trans DESC
        `;

        // Procesar resultados (ej. convertir BigInt a Number si es necesario, manejar fotos)
        const processedCollections = pendingCollections.map(collection => ({
            ...collection,
            nombre_origen: `${collection.nom_us} ${collection.ap_pat_us} ${collection.ap_mat_us || ''}`.trim(),
            foto_origen: undefined, // No enviar bytea
            tiene_foto: collection.foto_origen !== null
        }));

        return processedCollections;
    } catch (err) {
        console.error('Error en getPendingCollections:', err);
        throw new Error((err as Error).message);
    }
}

export async function confirmPayment(cod_us: number, cod_escrow: number) {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Verificar que el escrow existe, está retenido y pertenece al usuario (como destino)
            const escrowData: any[] = await tx.$queryRaw`
                SELECT e.cod_escrow, e.monto_pagado, e.monto_pagado_bs, e.estado_escrow, t.cod_us_destino
                FROM escrow e
                INNER JOIN transaccion t ON e.cod_trans = t.cod_trans
                WHERE e.cod_escrow = ${cod_escrow}::INTEGER
            `;

            if (!escrowData || escrowData.length === 0) {
                throw new Error('Escrow no encontrado.');
            }

            const escrow = escrowData[0];

            if (escrow.cod_us_destino !== cod_us) {
                throw new Error('No tienes permiso para liberar este pago.');
            }

            if (escrow.estado_escrow !== 'retenido') {
                throw new Error('El pago no está en estado retenido.');
            }

            // 2. Actualizar estado del escrow a 'liberado'
            await tx.$queryRaw`
                UPDATE escrow
                SET estado_escrow = 'liberado'::"EscrowState"
                WHERE cod_escrow = ${cod_escrow}::INTEGER
            `;

            // 3. Actualizar saldo de la billetera del usuario destino
            // Se asume que monto_pagado es CV (saldo_actual) y monto_pagado_bs es Bs (saldo_real).
            // Si son nulos, se tratan como 0.
            const montoCV = Number(escrow.monto_pagado || 0);
            const montoBs = Number(escrow.monto_pagado_bs || 0);

            await tx.$queryRaw`
                UPDATE billetera
                SET saldo_actual = saldo_actual + ${montoCV}::DECIMAL,
                    saldo_real = saldo_real + ${montoBs}::DECIMAL
                WHERE cod_us = ${cod_us}::INTEGER
            `;

            return { success: true, message: 'Pago recibido y liberado correctamente.' };
        });
    } catch (err) {
        console.error('Error en confirmPayment:', err);
        throw new Error((err as Error).message);
    }
}