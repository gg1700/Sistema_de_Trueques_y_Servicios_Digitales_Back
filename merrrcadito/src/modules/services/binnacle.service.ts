import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Funcion de Servicio sin controlador ni ruta (Auxiliar)
export async function register_transaction_binnacle(cod_trans: string) {
    try {
        const exists_transaction = await prisma.$queryRaw`
            SELECT * FROM sp_verificarexistenciatransaccion(
                ${cod_trans}::INTEGER
            ) AS result_trans
        `;
        const [result] = exists_transaction as any[];
        const { result_trans } = result;
        if (!result_trans) {
            return { success: false, message: 'El codigo de la transaccion asociada no existe.' };
        }
        await prisma.$queryRaw`
            SELECT sp_registrartransaccionbitacora(
                ${cod_trans}::INTEGER
            )
        `;
        return { success: true, message: 'Transaccion registrada en bitacora correctamente.' }
    } catch (err) {
        throw new Error((err as Error).message);
    }
}