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
                // Verificar saldo del usuario origen
                const saldo_us_origen: any[] = await prisma.$queryRaw`
                    SELECT saldo_actual FROM billetera
                    WHERE cod_us = ${cod_us_origen}::INTEGER
                `;
                const [wallet_origin] = saldo_us_origen;
                const { saldo_real } = wallet_origin;
                const event_cost: any[] = await prisma.$queryRaw`
                    SELECT precio_real FROM paquete_token
                    WHERE id = ${attributes.id_token}::INTEGER
                `;
                const [event] = event_cost;
                const { precio_real } = event;

                // Determinar el estado de la transacción según el saldo del usuario origen y el costo del evento
                if (saldo_real < precio_real) {
                    estado_trans = 'no_satisfactorio';
                } else {
                    monto_pagado_bs = precio_real;
                    estado_trans = 'satisfactorio';
                    // Actualizar el saldo del usuario origen
                    await prisma.$queryRaw`
                        UPDATE billetera
                        SET saldo_real = saldo_real - ${precio_real}::DECIMAL
                        WHERE cod_us = ${cod_us_origen}::INTEGER
                    `;
                }
            }
        } else {
            // Ni publicación ni evento proporcionado correctamente
            throw new Error('Debe proporcionar un código de publicación o un código de evento válido.');
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
        const [trans_cod] : any = transaction;
        const { cod_trans } = trans_cod;
        await prisma.$queryRaw`
            SELECT sp_registrarpagoescrow(
                ${cod_trans}::INTEGER,
                ${monto_pagado ?? null}::DECIMAL,
                ${monto_pagado_bs ?? null}::DECIMAL
            )
        `;
        const binnacle_result = await BinnacleService.register_transaction_binnacle(cod_trans);
        if(!binnacle_result.success){
            return binnacle_result;
        }
        return { success: true, message: "Transacción registrada correctamente" };
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_user_transaction_history(cod_us: string) {
    try {   
        const transaction_history : TransactionInfo[] = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerhistorialtransaccionesusuario(
                ${cod_us}::INTEGER
            )
        `;
        const filtered_transaction_history : TransactionInfo[] = []
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
