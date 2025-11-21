import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function get_events_by_user (cod_us: string) {
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