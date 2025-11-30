import { PrismaClient } from "@prisma/client";

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
        const result = await prisma.$queryRaw`
            SELECT * FROM sp_inscribirEventoConPago(
                ${cod_us}::INTEGER,
                ${cod_evento}::INTEGER
            )
        ` as any[];

        if (result && result.length > 0) {
            const { success, message } = result[0];
            return { success, message };
        }

        return { success: false, message: "Error desconocido al procesar la inscripción" };
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
