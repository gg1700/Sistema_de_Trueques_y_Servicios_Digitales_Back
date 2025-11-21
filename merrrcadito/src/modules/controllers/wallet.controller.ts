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

export async function getWalletDataByUser (req: Request, res: Response) {
    try {
        const { cod_us } = req.query;
        if (!cod_us || typeof cod_us !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Codigo de usuario asociado invalido.',
            });
        }
        const wallet_data = await WalletService.get_wallet_data_by_user(cod_us);
        if (!wallet_data) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron datos de billetera para el usuario solicitado.',
                data: []
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Datos de billetera del usuario correctamente accesados.',
            data: wallet_data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los datos de la billetera del usuario: ',
            error: (err as Error).message
        });
    }
}