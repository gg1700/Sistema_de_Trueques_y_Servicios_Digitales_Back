import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function get_events_by_user(cod_us: string) {
    try {
        const exists = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciacodusuario(${parseInt(cod_us)}::INTEGER) AS result
        `;
        const [ans] = exists as any[];
        const { result } = ans;
        if (!result) {
            throw new Error('El codigo del usuario solicitado no existe.');
        }
        const user_events = await prisma.$queryRaw`
            SELECT * FROM sp_obtenereventosusuario(
                ${parseInt(cod_us)}::INTEGER
            )
        `;
        return user_events;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function create_event(eventData: any, bannerBuffer: Buffer | null) {
    try {
        const {
            titulo_evento,
            descripcion_evento,
            fecha_inicio_evento,
            fecha_finalizacion_evento,
            duracion_evento,
            tipo_evento,
            costo_inscripcion,
            cod_org
        } = eventData;

        // Validar existencia de la organización
        const orgExists = await prisma.$queryRaw`
            SELECT cod_org FROM organizacion WHERE cod_org = ${parseInt(cod_org)}
        ` as any[];

        if (orgExists.length === 0) {
            throw new Error("La organización no existe.");
        }

        // Insertar evento
        const result = await prisma.$queryRaw`
            INSERT INTO evento(
                titulo_evento,
                descripcion_evento,
                fecha_inicio_evento,
                fecha_finalizacion_evento,
                duracion_evento,
                banner_evento,
                cant_personas_inscritas,
                estado_evento,
                tipo_evento,
                costo_inscripcion,
                cod_org
            ) VALUES(
                ${titulo_evento}::VARCHAR,
                ${descripcion_evento}::TEXT,
                ${new Date(fecha_inicio_evento)}::TIMESTAMP,
                ${new Date(fecha_finalizacion_evento)}::TIMESTAMP,
                ${duracion_evento}::INT,
                ${bannerBuffer}::BYTEA,
                0,
                'vigente',
                ${tipo_evento}::"EventType",
                ${parseFloat(costo_inscripcion)}::DECIMAL,
                ${parseInt(cod_org)}::INTEGER
            )
            RETURNING cod_evento
        ` as any[];

        return { success: true, data: result[0] };
    } catch (err) {
        console.error("Error creating event:", err);
        throw new Error((err as Error).message);
    }
}

export async function get_events_by_org(cod_org: number) {
    try {
        const events = await prisma.$queryRaw`
            SELECT * FROM evento 
            WHERE cod_org = ${cod_org}::INTEGER 
            AND estado_evento = 'vigente'
            ORDER BY fecha_inicio_evento ASC
        ` as any[];
        return events;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}