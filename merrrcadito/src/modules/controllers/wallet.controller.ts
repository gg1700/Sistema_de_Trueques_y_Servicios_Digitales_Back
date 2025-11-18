import { Request, Response } from "express";
import * as WalletService from "../services/wallet.service";

export async function createWallet (req: Request, res: Response) {
    try {
        const { cod_us, cuenta_bancaria, saldo_actual } = req.query;
        if (!cod_us || typeof cod_us !== 'string' || !cuenta_bancaria || typeof cuenta_bancaria !== 'string' || saldo_actual === undefined || typeof saldo_actual !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Parámetros de consulta inválidos"
            });
        }
        const result = await WalletService.create_wallet(cod_us, cuenta_bancaria, saldo_actual);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
        return res.status(200).json({
            success: true,
            message: result.message
        });
    }catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear la billetera: ',
            error: (error as Error).message
        });   
    }
}