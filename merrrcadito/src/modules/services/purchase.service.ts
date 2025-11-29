import * as TransactionService from './transaction.service';
import * as UserService from './user.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PurchaseResult {
    success: boolean;
    message: string;
    new_balance?: number;
    tokens_spent?: number;
    co2_impact_increase?: number;
}

export async function purchaseProduct(
    cod_us_comprador: string,
    cod_pub: string
): Promise<PurchaseResult> {
    try {
        console.log(`[PURCHASE] Iniciando compra - Usuario: ${cod_us_comprador}, Publicación: ${cod_pub}`);

        // 1. Registrar la transacción (esto ya maneja todo: validación, actualización de billeteras, etc.)
        console.log('[PURCHASE] Llamando a register_transaction...');
        await TransactionService.register_transaction(cod_us_comprador, {
            cod_pub: cod_pub,
            cod_evento: null,
            cod_potenciador: null,
            descr_trans: 'Compra de producto',
            moneda: 'CV',
            monto_regalo: null,
            id_token: null
        });
        console.log('[PURCHASE] Transacción registrada exitosamente');

        // 2. Actualizar impacto CO2
        console.log('[PURCHASE] Actualizando CO2...');
        await UserService.update_co2_impact_post(cod_us_comprador, cod_pub);
        console.log('[PURCHASE] CO2 actualizado');

        // 3. Obtener nuevo saldo
        console.log('[PURCHASE] Obteniendo nuevo saldo...');
        const newWallet = await prisma.$queryRaw`
            SELECT saldo_actual FROM billetera WHERE cod_us = ${parseInt(cod_us_comprador)}
        ` as any[];

        const new_balance = parseFloat(newWallet[0]?.saldo_actual?.toString() || '0');
        console.log(`[PURCHASE] Nuevo saldo: ${new_balance}`);

        // 4. Obtener precio de la publicación para calcular tokens gastados
        console.log('[PURCHASE] Obteniendo precio del producto...');
        const precio = await prisma.$queryRaw`
            SELECT prod.precio_prod, pub_prod.cant_prod 
            FROM publicacion_producto AS pub_prod
            JOIN producto AS prod ON pub_prod.cod_prod = prod.cod_prod
            WHERE pub_prod.cod_pub = ${parseInt(cod_pub)}
        ` as any[];

        const tokens_spent = precio[0] ? parseFloat(precio[0].precio_prod?.toString() || '0') * parseFloat(precio[0].cant_prod?.toString() || '1') : 0;
        console.log(`[PURCHASE] Tokens gastados: ${tokens_spent}`);

        return {
            success: true,
            message: 'Compra realizada exitosamente',
            new_balance: new_balance,
            tokens_spent: tokens_spent,
            co2_impact_increase: 0
        };

    } catch (error) {
        console.error('[PURCHASE] Error en purchaseProduct:', error);
        throw new Error((error as Error).message);
    }
}

