import { Request, Response } from "express";
import * as EventService from '../services/event.service';

export async function getEventsByUser (req: Request, res: Response) {
    try {
        const { cod_us } = req.query;
        if (!cod_us || typeof cod_us !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Codigo de usuario asociado invalido.'
            });
        }
        const user_events = await EventService.get_events_by_user(cod_us);
        if (!user_events) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron eventos para el usuario solicitado.',
                data: []
            });
        }
        return res.status(500).json({
            success: true,
            message: 'Datos de eventos asociados al usuario obtenidos satisfactoriamente.',
            data: user_events
        });
    } catch (err) { 
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los datos de los eventos del usuario',
            error: (err as Error).message
        });
    }
}