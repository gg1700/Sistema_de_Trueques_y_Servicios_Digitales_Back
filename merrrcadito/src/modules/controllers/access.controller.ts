import { Request, Response } from "express";
import * as AccessService from "../services/access.service";

export async function registerAccess(req: Request, res: Response) {
    try {
        const { cod_us, contra_acc } = req.query;
        if (!cod_us || typeof cod_us !== 'string' || !contra_acc || typeof contra_acc !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Parámetros de consulta inválidos"
            });
        }
        const result = await AccessService.register_access(cod_us, contra_acc);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar el acceso: ',
            error: (error as Error).message
        });
    }
}

export async function registerLogout(req: Request, res: Response) {
    try {
        const { cod_us } = req.query;
        if (!cod_us || typeof cod_us !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Parámetros de consulta inválidos"
            });
        }
        const result = await AccessService.register_logout(cod_us);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    }catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar el cierre de sesión: ',
            error: (error as Error).message
        });
    }
}

export async function getCompleteAccessHistoryByMonth(req: Request, res: Response) {
    try {
        const { month } = req.query;
        if (!month || typeof month !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Mes invalido.'
            });
        }
        const access_history = await AccessService.get_complete_access_history_by_month(month);
        if (!access_history) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron transacciones para el mes especificado.',
                data: []
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Datos de transacciones en el mes obtenidas correctamente.',
            data: access_history
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de accesos en el mes.',
            error: (err as Error).message
        });
    }
}