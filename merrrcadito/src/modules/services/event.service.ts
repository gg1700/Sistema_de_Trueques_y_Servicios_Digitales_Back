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

// Nueva función para obtener eventos PROPIOS del usuario (creados por el usuario)
export async function get_user_created_events(cod_us: string) {
    try {
        // Reemplazamos el SP defectuoso con una consulta directa que filtra por cod_us_creador
        // Esta columna fue agregada para distinguir inequívocamente al creador
        const user_created_events = await prisma.$queryRaw`
            SELECT 
                e.cod_evento,
                e.titulo_evento,
                e.descripcion_evento,
                e.fecha_registro_evento,
                e.fecha_inicio_evento,
                e.fecha_finalizacion_evento,
                e.duracion_evento,
                e.banner_evento,
                e.cant_personas_inscritas,
                e.ganancia_evento,
                e.estado_evento::VARCHAR,
                e.tipo_evento::VARCHAR,
                e.costo_inscripcion,
                e.impacto_amb_inter,
                (e.banner_evento IS NOT NULL) as tiene_banner
            FROM EVENTO e
            WHERE e.cod_us_creador = ${parseInt(cod_us)}::INTEGER
            ORDER BY e.fecha_registro_evento DESC
        `;
        return convertBigIntToNumber(user_created_events);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// Función sobrecargada para crear un evento (soporta ambos modos: por usuario y por organización)
export async function create_event(eventData: {
    cod_us: number;
    titulo_evento: string;
    descripcion_evento: string;
    fecha_inicio_evento: string;
    fecha_finalizacion_evento: string;
    tipo_evento: string;
    banner_evento?: Buffer | null;
    costo_inscripcion?: number;
    cod_rec?: number | null;
}): Promise<number>;

export async function create_event(eventData: any, bannerBuffer: Buffer | null): Promise<{ success: boolean; data: any }>;

export async function create_event(eventData: any, bannerBuffer?: Buffer | null): Promise<any> {
    try {
        // Si tiene cod_us en eventData, es creación por usuario (HEAD)
        if ('cod_us' in eventData && eventData.cod_us !== undefined) {
            const {
                cod_us,
                titulo_evento,
                descripcion_evento,
                fecha_inicio_evento,
                fecha_finalizacion_evento,
                tipo_evento,
                banner_evento = null,
                costo_inscripcion = 0.0,
                cod_rec = null
            } = eventData;

            const result = await prisma.$queryRaw`
                SELECT sp_registrarEvento(
                    ${cod_us}::INTEGER,
                    ${titulo_evento}::VARCHAR,
                    ${descripcion_evento}::TEXT,
                    ${fecha_inicio_evento}::DATE,
                    ${fecha_finalizacion_evento}::DATE,
                    ${tipo_evento}::VARCHAR,
                    ${banner_evento}::BYTEA,
                    ${costo_inscripcion}::NUMERIC,
                    ${cod_rec}::INTEGER
                ) AS cod_evento
            `;

            const [row] = result as any[];
            return row.cod_evento;
        }

        // Si tiene cod_org, es creación por organización (Backend-Mateo)
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

// Obtener todas las recompensas disponibles
export async function get_all_rewards() {
    try {
        const rewards = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerTodasRecompensas()
        `;
        return convertBigIntToNumber(rewards);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}

// Obtener eventos por organización
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

// Obtener todos los eventos activos (vigentes) para la sección pública
export async function get_all_events() {
    try {
        const events = await prisma.$queryRaw`
            SELECT 
                e.cod_evento,
                e.titulo_evento,
                e.descripcion_evento,
                e.fecha_inicio_evento,
                e.fecha_finalizacion_evento,
                e.duracion_evento,
                e.cant_personas_inscritas,
                e.estado_evento,
                e.tipo_evento,
                e.costo_inscripcion,
                e.impacto_amb_inter,
                e.banner_evento IS NOT NULL as tiene_banner,
                o.nom_com_org as organizacion_nombre,
                o.logo_org IS NOT NULL as tiene_logo_org,
                COALESCE(
                    (SELECT monto_rec FROM recompensa r 
                     INNER JOIN evento_recompensa er ON r.cod_rec = er.cod_rec 
                     WHERE er.cod_evento = e.cod_evento 
                     LIMIT 1),
                    0
                ) as monto_recompensa
            FROM evento e
            LEFT JOIN organizacion o ON e.cod_org = o.cod_org
            WHERE e.estado_evento = 'vigente'
            ORDER BY e.fecha_inicio_evento ASC
        ` as any[];

        return convertBigIntToNumber(events);
    } catch (err) {
        console.error('Error en get_all_events:', err);
        throw new Error((err as Error).message);
    }
}