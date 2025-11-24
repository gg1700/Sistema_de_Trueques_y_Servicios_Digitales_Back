import { Request, Response } from 'express';
import * as ExchangeService from '../services/exchange.service';

export async function getUserExchangeHistory(req: Request, res: Response) {
    try {
        const { cod_us } = req.query;

        if (!cod_us || typeof cod_us !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Código de usuario requerido'
            });
        }

        const exchange_history = await ExchangeService.get_user_exchange_history(cod_us);

        if (!exchange_history || exchange_history.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay intercambios registrados',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Historial de intercambios obtenido correctamente',
            data: exchange_history
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de intercambios del usuario',
            error: (err as Error).message
        });
    }
}
