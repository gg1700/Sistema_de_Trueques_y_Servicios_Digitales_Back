import { Request, Response } from "express";
import * as TransactionService from "../services/transaction.service";

export async function registerTransaction(req: Request, res: Response) {
    try {
        const { cod_us_origen } = req.query;
        const attributes = req.body;
        if (!cod_us_origen || typeof cod_us_origen !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Parámetros de consulta inválidos"
            });
        }
        if (!attributes) {
            return res.status(400).json({
                success: false,
                message: "Faltan atributos para registrar la transacción"
            });
        }
        await TransactionService.register_transaction(cod_us_origen, attributes);
        return res.status(200).json({
            success: true,
            message: 'Transacción registrada exitosamente.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar la transacción: ',
            error: (error as Error).message
        });
    }
}