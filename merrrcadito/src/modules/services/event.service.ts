import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function get_events_by_user(cod_us: string) {
    try {
        const exists = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciacodusuario(${cod_us}::INTEGER) AS result
        `;
        const [ans] = exists as any[];
        const { result } = ans;
        if (!result) {
            throw new Error('El codigo del usuario solicitado no existe.');
        }
        const user_events = await prisma.$queryRaw`
            SELECT * FROM sp_obtenereventosusuario(
                ${cod_us}::INTEGER
            )
        `;
        return user_events;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// Nueva función para obtener eventos PROPIOS del usuario (creados por el usuario)
export async function get_user_created_events(cod_us: string) {
    try {
        const user_created_events = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerEventosPropiosUsuario(
                ${cod_us}::INTEGER
            )
        `;
        return convertBigIntToNumber(user_created_events);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// Nueva función para crear un evento
export async function create_event(eventData: {
    cod_us: number;
    titulo_evento: string;
    descripcion_evento: string;
    fecha_inicio_evento: string;
    fecha_finalizacion_evento: string;
    tipo_evento: string;
    banner_evento?: Buffer | null;
    costo_inscripcion?: number;
}) {
    try {
        const {
            cod_us,
            titulo_evento,
            descripcion_evento,
            fecha_inicio_evento,
            fecha_finalizacion_evento,
            tipo_evento,
            banner_evento = null,
            costo_inscripcion = 0.0
        } = eventData;

        const result = await prisma.$queryRaw`
            SELECT sp_registrarEvento(
                ${cod_us}::INTEGER,
                ${titulo_evento}::VARCHAR,
                ${descripcion_evento}::VARCHAR,
                ${fecha_inicio_evento}::DATE,
                ${fecha_finalizacion_evento}::DATE,
                ${tipo_evento}::VARCHAR,
                ${banner_evento}::BYTEA,
                ${costo_inscripcion}::NUMERIC
            ) AS cod_evento
        `;

        const [row] = result as any[];
        return row.cod_evento;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// Nueva función para obtener la imagen del evento
export async function get_event_image(cod_evento: string) {
    try {
        const result = await prisma.$queryRaw`
            SELECT banner_evento FROM evento WHERE cod_evento = ${cod_evento}::INTEGER
        `;
        const [event] = result as any[];
        return event?.banner_evento || null;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// Nueva función para actualizar la imagen del evento
export async function update_event_image(cod_evento: string, banner_evento: Buffer) {
    try {
        await prisma.$executeRaw`
            UPDATE evento SET banner_evento = ${banner_evento}::BYTEA
            WHERE cod_evento = ${cod_evento}::INTEGER
        `;
        return true;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// Helper function to convert BigInt to Number
function convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
    if (obj instanceof Date) return obj;
    if (typeof obj === 'object') {
        const converted: any = {};
        for (const key in obj) {
            converted[key] = convertBigIntToNumber(obj[key]);
        }
        return converted;
    }
    return obj;
}

// REPORTE: Eventos por Organización
export async function get_events_organization_report(mes: string, anio: string) {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteEventosPorOrganizacion(
                ${mes}::INTEGER,
                ${anio}::INTEGER
            )
        `;
        return convertBigIntToNumber(report);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}