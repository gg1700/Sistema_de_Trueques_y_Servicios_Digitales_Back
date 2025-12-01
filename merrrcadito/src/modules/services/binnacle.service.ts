import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Funcion de Servicio sin controlador ni ruta (Auxiliar)
// Acepta un cliente de transacción opcional para trabajar dentro de transacciones atómicas
export async function register_transaction_binnacle(
    cod_trans: string,
    txClient?: Prisma.TransactionClient
) {
    try {
        // Usar el cliente transaccional si se proporciona, sino usar el global
        const client = txClient || prisma;

        const exists_transaction = await client.$queryRaw`
            SELECT * FROM sp_verificarexistenciatransaccion(
                ${cod_trans}::INTEGER
            ) AS result_trans
        `;
        const [result] = exists_transaction as any[];
        const { result_trans } = result;
        if (!result_trans) {
            return { success: false, message: 'El codigo de la transaccion asociada no existe.' };
        }

        // Verificar si ya existe un registro en la bitácora para esta transacción
        const existingBinnacle = await client.$queryRaw`
            SELECT cod_trans FROM bitacora WHERE cod_trans = ${cod_trans}::INTEGER
        ` as any[];

        if (existingBinnacle.length > 0) {
            console.log(`[BINNACLE] Registro ya existe para transacción ${cod_trans}, omitiendo inserción`);
            return { success: true, message: 'Transaccion ya registrada en bitacora.' };
        }

        // Solo insertar si no existe
        await client.$queryRaw`
            SELECT FROM sp_registrartransaccionbitacora(
                ${cod_trans}::INTEGER
            )
        `;
        return { success: true, message: 'Transaccion registrada en bitacora correctamente.' }
    } catch (err) {
        console.error('[BINNACLE ERROR] Error al registrar en bitácora:', {
            cod_trans,
            error: (err as Error).message
        });
        throw new Error((err as Error).message);
    }
}