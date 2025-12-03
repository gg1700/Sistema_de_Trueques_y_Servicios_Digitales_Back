import { PrismaClient } from '@prisma/client';
import * as TransactionService from './transaction.service';
import * as UserService from './user.service';
import * as PromotionService from './promotion.service';

const prisma = new PrismaClient();

interface PurchaseResult {
    success: boolean;
    message: string;
    new_balance?: number;
    tokens_spent?: number;
    co2_impact_increase?: number;
    discount_applied?: number;
    promotion_title?: string;
}

export async function purchaseProduct(
    cod_us_comprador: string,
    cod_pub: string
): Promise<PurchaseResult> {
    try {
        console.log(`[PURCHASE] Iniciando compra - Usuario: ${cod_us_comprador}, Publicación: ${cod_pub}`);

        // 1. Obtener información de la publicación y su dueño
        console.log('[PURCHASE] Obteniendo información de la publicación...');
        const publicationInfo = await prisma.$queryRaw`
            SELECT p.cod_us as owner_id
            FROM publicacion p
            WHERE p.cod_pub = ${parseInt(cod_pub)}
        ` as any[];

        if (!publicationInfo.length) {
            throw new Error('La publicación no existe');
        }

        const owner_id = publicationInfo[0].owner_id;
        console.log(`[PURCHASE] Dueño de la publicación: ${owner_id}, Comprador: ${cod_us_comprador}`);

        // 2. VALIDACIÓN: Prevenir autocompra
        if (parseInt(cod_us_comprador) === owner_id) {
            throw new Error('No puedes comprar tus propios productos');
        }

        // 3. Obtener precio con descuento (si aplica)
        console.log('[PURCHASE] Obteniendo precio con descuento...');
        const priceData = await PromotionService.getPublicationPrice(parseInt(cod_pub));

        if (!priceData) {
            throw new Error('No se pudo obtener el precio de la publicación');
        }

        const tokens_spent = Number(priceData.total_con_descuento);
        const discount_applied = Number(priceData.descuento);
        const promotion_title = priceData.titulo_prom;

        console.log(`[PURCHASE] Precio original: ${priceData.total_original}, Con descuento: ${tokens_spent}, Descuento: ${discount_applied}%`);

        // 4. VALIDACIÓN: Verificar saldo suficiente
        console.log('[PURCHASE] Verificando saldo del comprador...');
        const walletData = await prisma.$queryRaw`
            SELECT saldo_actual FROM billetera WHERE cod_us = ${parseInt(cod_us_comprador)}
        ` as any[];

        if (!walletData.length) {
            throw new Error('No se encontró la billetera del usuario');
        }

        const current_balance = parseFloat(walletData[0].saldo_actual?.toString() || '0');
        console.log(`[PURCHASE] Saldo actual: ${current_balance}, Precio: ${tokens_spent}`);

        if (current_balance < tokens_spent) {
            throw new Error(`Saldo insuficiente para realizar esta compra. Necesitas ${tokens_spent.toFixed(2)} CV pero solo tienes ${current_balance.toFixed(2)} CV`);
        }

        // 5. Registrar la transacción (esto ya maneja todo: validación, actualización de billeteras, etc.)
        console.log('[PURCHASE] Llamando a register_transaction...');
        await TransactionService.register_transaction(cod_us_comprador, {
            cod_pub: cod_pub,
            cod_evento: null,
            cod_potenciador: null,
            descr_trans: priceData.tiene_promocion
                ? `Compra de producto con promoción: ${promotion_title}`
                : 'Compra de producto',
            moneda: 'CV',
            monto_regalo: null,
            id_token: null
        });
        console.log('[PURCHASE] Transacción registrada exitosamente');

        // 6. Actualizar impacto CO2 (solo para productos)
        console.log('[PURCHASE] Actualizando CO2...');
        try {
            await UserService.update_co2_impact_post(cod_us_comprador, cod_pub);
            console.log('[PURCHASE] CO2 actualizado');
        } catch (co2Error) {
            // Algunos tipos de publicaciones (ej. servicios) pueden no tener cálculo de CO2
            console.log('[PURCHASE] No se pudo actualizar CO2 (puede ser un servicio):', (co2Error as Error).message);
        }

        // 7. Obtener nuevo saldo
        console.log('[PURCHASE] Obteniendo nuevo saldo...');
        const newWallet = await prisma.$queryRaw`
            SELECT saldo_actual FROM billetera WHERE cod_us = ${parseInt(cod_us_comprador)}
        ` as any[];

        const new_balance = parseFloat(newWallet[0]?.saldo_actual?.toString() || '0');
        console.log(`[PURCHASE] Nuevo saldo: ${new_balance}`);

        return {
            success: true,
            message: priceData.tiene_promocion
                ? `Compra realizada exitosamente con ${discount_applied}% de descuento`
                : 'Compra realizada exitosamente',
            new_balance: new_balance,
            tokens_spent: tokens_spent,
            co2_impact_increase: 0,
            discount_applied: discount_applied,
            promotion_title: promotion_title || undefined
        };

    } catch (error) {
        console.error('[PURCHASE] Error en purchaseProduct:', error);
        // Re-lanzar el error con el mensaje específico para que llegue al frontend
        throw new Error((error as Error).message);
    }
}
