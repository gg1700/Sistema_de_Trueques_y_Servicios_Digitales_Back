import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function create_wallet(cod_us: string, cuenta_bancaria: string, saldo_actual: string) {
    try {
        const exists = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciacodusuario(${cod_us}::INTEGER) AS result
        `;
        const [ans] = exists as any[];
        const { result } = ans;
        if (!result) {
            return { success: false, message: 'El usuario asociado no existe.' };
        }
        await prisma.$queryRaw`
            SELECT sp_crearbilletera(
                ${cod_us}::INTEGER,
                ${cuenta_bancaria}::VARCHAR,
                ${saldo_actual}::DECIMAL
            )
        `;
        return { success: true, message: "Billetera creada correctamente" };
    }catch (err) {
        throw new Error((err as Error).message);
    }
}

export async function get_wallet_data_by_user(cod_us: string) {
    try {
        const exixts = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciacodusuario(${cod_us}::INTEGER) AS result
        `;
        const [ans] = exixts as any[];
        const { result } = ans;
        if (!result) {
            throw new Error('El codigo del usuario solicitado no existe.');
        }
        const wallet_data = await prisma.$queryRaw`
            SELECT * FROM sp_obtenerdatosbilleterausuario(
                ${cod_us}::INTEGER
            )
        `;
        return wallet_data;
    } catch (err) {
        throw new Error((err as Error).message);
    }
}