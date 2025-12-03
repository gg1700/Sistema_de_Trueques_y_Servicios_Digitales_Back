import { PrismaClient } from "@prisma/client";
import { increase_user_ecological_impact } from "./user.service";

const prisma = new PrismaClient();

/**
 * Obtener eventos en los que está inscrito un usuario
 */
export async function getUserEnrolledEvents(cod_us: number) {
    try {
        const events = await prisma.$queryRaw`
      SELECT 
        ue.cod_evento,
        ue.cod_us,
        e.titulo_evento,
        e.descripcion_evento,
        e.fecha_inicio_evento,
        e.fecha_finalizacion_evento,
        e.duracion_evento,
        e.banner_evento,
        e.cant_personas_inscritas,
        e.estado_evento,
        e.tipo_evento,
        e.costo_inscripcion,
        o.nom_com_org as organizacion_nombre,
        o.logo_org as organizacion_logo
      FROM usuario_evento ue
      INNER JOIN evento e ON ue.cod_evento = e.cod_evento
      LEFT JOIN organizacion o ON e.cod_org = o.cod_org
      WHERE ue.cod_us = ${cod_us}::INTEGER
      AND e.estado_evento = 'vigente'
      ORDER BY e.fecha_inicio_evento ASC
    ` as any[];

        return { success: true, data: events };
    } catch (err) {
        console.error("Error en getUserEnrolledEvents:", err);
        throw new Error((err as Error).message);
    }
}

/**
 * Inscribir a un usuario en un evento
 */
export async function enrollUserInEvent(cod_us: number, cod_evento: number) {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Obtener información del evento
            const eventData: any[] = await tx.$queryRaw`
                SELECT costo_inscripcion, impacto_amb_inter, cod_us_creador
                FROM evento 
                WHERE cod_evento = ${cod_evento}::INTEGER
                AND estado_evento = 'vigente'
            `;

            if (!eventData || eventData.length === 0) {
                return { success: false, message: "Evento no encontrado o no está vigente" };
            }

            const evento = eventData[0];
            const costoInscripcion = Number(evento.costo_inscripcion || 0);
            const impactoEvento = Number(evento.impacto_amb_inter || 0);

            // 2. Verificar si el usuario ya está inscrito
            const existingEnrollment: any[] = await tx.$queryRaw`
                SELECT cod_us FROM usuario_evento
                WHERE cod_us = ${cod_us}::INTEGER
                AND cod_evento = ${cod_evento}::INTEGER
            `;

            if (existingEnrollment.length > 0) {
                return { success: false, message: "Ya estás inscrito en este evento" };
            }

            // 3. Verificar saldo del usuario (solo si el evento tiene costo)
            if (costoInscripcion > 0) {
                const walletData: any[] = await tx.$queryRaw`
                    SELECT saldo_actual FROM billetera
                    WHERE cod_us = ${cod_us}::INTEGER
                `;

                if (!walletData || walletData.length === 0) {
                    return { success: false, message: "No se encontró la billetera del usuario" };
                }

                const saldoActual = Number(walletData[0].saldo_actual);

                if (saldoActual < costoInscripcion) {
                    return { success: false, message: "Saldo insuficiente para realizar la inscripción" };
                }

                // 4. Descontar el costo de la billetera
                await tx.$executeRaw`
                    UPDATE billetera
                    SET saldo_actual = saldo_actual - ${costoInscripcion}::DECIMAL
                    WHERE cod_us = ${cod_us}::INTEGER
                `;

                // 5. Crear transacción
                await tx.$executeRaw`
                    INSERT INTO transaccion (
                        cod_us_origen,
                        cod_us_destino,
                        cod_evento,
                        desc_trans,
                        moneda,
                        estado_trans
                    ) VALUES (
                        ${cod_us}::INTEGER,
                        ${evento.cod_us_creador}::INTEGER,
                        ${cod_evento}::INTEGER,
                        'Inscripción a evento: ' || (SELECT titulo_evento FROM evento WHERE cod_evento = ${cod_evento}::INTEGER),
                        'CV'::"Currency",
                        'satisfactorio'::"TransactionState"
                    )
                `;
            }

            // 6. Inscribir al usuario en el evento
            await tx.$executeRaw`
                INSERT INTO usuario_evento (cod_us, cod_evento, impacto_amb_inter)
                VALUES (
                    ${cod_us}::INTEGER,
                    ${cod_evento}::INTEGER,
                    ${impactoEvento}::DECIMAL
                )
            `;

            // 7. Incrementar contador de personas inscritas
            await tx.$executeRaw`
                UPDATE evento
                SET cant_personas_inscritas = cant_personas_inscritas + 1
                WHERE cod_evento = ${cod_evento}::INTEGER
            `;

            // 8. Aumentar huella de CO2 del usuario
            if (impactoEvento > 0) {
                await increase_user_ecological_impact(cod_us, impactoEvento);
            }

            console.log(`[EVENT ENROLLMENT] Usuario ${cod_us} inscrito en evento ${cod_evento} (Costo: ${costoInscripcion} CV)`);

            return {
                success: true,
                message: costoInscripcion > 0
                    ? `Inscripción exitosa. Se han descontado ${costoInscripcion} CV de tu saldo.`
                    : "Inscripción exitosa."
            };
        });
    } catch (err) {
        console.error("Error en enrollUserInEvent:", err);
        const errorMessage = (err as Error).message;
        if (errorMessage.includes('Saldo insuficiente')) {
            return { success: false, message: "Saldo insuficiente para realizar la inscripción" };
        }
        throw new Error(errorMessage);
    }
}

/**
 * Desinscribir a un usuario de un evento
 */
export async function unenrollUserFromEvent(cod_us: number, cod_evento: number) {
    try {
        const result = await prisma.$queryRaw`
      DELETE FROM usuario_evento 
      WHERE cod_us = ${cod_us}::INTEGER 
      AND cod_evento = ${cod_evento}::INTEGER
      RETURNING cod_evento
    ` as any[];

        if (result.length === 0) {
            return { success: false, message: "No estás inscrito en este evento" };
        }

        // Decrementar contador de personas inscritas
        await prisma.$queryRaw`
      UPDATE evento 
      SET cant_personas_inscritas = GREATEST(0, cant_personas_inscritas - 1)
      WHERE cod_evento = ${cod_evento}::INTEGER
    `;

        return { success: true, message: "Desinscripción exitosa" };
    } catch (err) {
        console.error("Error en unenrollUserFromEvent:", err);
        throw new Error((err as Error).message);
    }
}

/**
 * Verificar si un usuario está inscrito en un evento
 */
export async function checkUserEnrollment(cod_us: number, cod_evento: number) {
    try {
        const result = await prisma.$queryRaw`
      SELECT cod_evento FROM usuario_evento 
      WHERE cod_us = ${cod_us}::INTEGER 
      AND cod_evento = ${cod_evento}::INTEGER
    ` as any[];

        return { success: true, isEnrolled: result.length > 0 };
    } catch (err) {
        console.error("Error en checkUserEnrollment:", err);
        throw new Error((err as Error).message);
    }
}
