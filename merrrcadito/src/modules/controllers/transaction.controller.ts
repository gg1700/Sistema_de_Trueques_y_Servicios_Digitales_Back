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

export async function getUserTransactionHistory(req: Request, res: Response) {
    try {
        const { cod_us } = req.query;
        if (!cod_us || typeof cod_us !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Codigo de usuario invalido.'
            });
        }
        const data = await TransactionService.get_user_transaction_history(cod_us);
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron datos para el usuario especificado.',
                data: null
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Datos del usuario obtenidos exitosamente.',
            data: data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los datos del historial de transaccion del usuario.',
            error: (err as Error).message
        });
    }
}

export async function getCompleteTransactionHistoryByMonth (req: Request, res: Response) {
    try {
        const { month } = req.query;
        if (!month || typeof month !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Mes invalido.'
            });
        }
        const data = await TransactionService.get_complete_transaction_history_by_month(month);
        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron transacciones para el mes especificado.',
                data: []
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Datos de transacciones en el mes obtenidas correctamente.',
            data: data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los datos del historial de transacciones del mes.',
            error: (err as Error).message
        });
    }
}