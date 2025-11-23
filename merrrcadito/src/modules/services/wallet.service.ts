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
    } catch (err) {
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
            SELECT 
                b.cod_bill as cod_billetera,
                b.cod_us,
                b.cuenta_bancaria,
                b.saldo_real,
                b.saldo_actual as saldo_creditos,
                (
                    SELECT MAX(t.fecha_trans) 
                    FROM transaccion t 
                    WHERE t.cod_us_origen = ${cod_us}::INTEGER OR t.cod_us_destino = ${cod_us}::INTEGER
                ) as fecha_ultima_trans
            FROM billetera b
            WHERE b.cod_us = ${cod_us}::INTEGER
        `;

        return wallet_data;
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

// REPORTE: Flujo de Billeteras
export async function get_wallet_flow_report() {
    try {
        const report = await prisma.$queryRaw`
            SELECT * FROM sp_reporteFlujoBilleteras()
        `;
        return convertBigIntToNumber(report);
    } catch (err) {
        throw new Error((err as Error).message);
    }
}