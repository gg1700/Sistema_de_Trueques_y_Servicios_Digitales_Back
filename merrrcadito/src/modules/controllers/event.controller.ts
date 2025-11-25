import { Request, Response } from "express";
import * as EventService from '../services/event.service';

export async function getEventsByUser(req: Request, res: Response) {
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
            return res.status(404).json({
                success: false,
                message: 'No se encontraron eventos para el usuario solicitado.',
                data: []
            });
        }
        return res.status(200).json({
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

export async function createEvent(req: Request, res: Response) {
    try {
        const eventData = req.body;
        const file = req.file;

        if (!eventData.titulo_evento || !eventData.cod_org) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos obligatorios (titulo_evento, cod_org)."
            });
        }

        const result = await EventService.create_event(eventData, file ? file.buffer : null);

        return res.status(201).json({
            success: true,
            message: "Evento creado exitosamente.",
            data: result
        });
    } catch (err) {
        console.error("Error en createEvent controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al crear el evento.",
            error: (err as Error).message
        });
    }
}

export async function getEventsByOrg(req: Request, res: Response) {
    try {
        const { cod_org } = req.query;
        if (!cod_org) {
            return res.status(400).json({
                success: false,
                message: "Falta el código de organización (cod_org)."
            });
        }

        const events = await EventService.get_events_by_org(Number(cod_org));

        return res.status(200).json({
            success: true,
            data: events
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener eventos de la organización.",
            error: (err as Error).message
        });
    }
}