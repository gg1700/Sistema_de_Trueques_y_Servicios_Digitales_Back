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

// Helper function to convert BigInt to Number
function convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
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