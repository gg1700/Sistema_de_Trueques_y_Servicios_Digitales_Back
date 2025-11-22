import { Request, Response } from 'express';
import * as PurchaseService from '../services/purchase.service';

export async function purchaseProduct(req: Request, res: Response) {
    try {
        const { cod_us } = req.query;
        const { cod_pub } = req.body;

        if (!cod_us || typeof cod_us !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Código de usuario inválido'
            });
        }

        if (!cod_pub) {
            return res.status(400).json({
                success: false,
                message: 'Código de publicación inválido'
            });
        }

        const result = await PurchaseService.purchaseProduct(
            cod_us,
            cod_pub.toString()
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al procesar la compra',
            error: (error as Error).message
        });
    }
}
