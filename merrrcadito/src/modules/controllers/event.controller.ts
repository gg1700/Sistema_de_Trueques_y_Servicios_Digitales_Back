import { Request, Response } from "express";
import * as EventService from '../services/event.service';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const uploadEventBanner = upload.single('banner_evento');

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
            return res.status(400).json({
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

export async function getUserCreatedEvents(req: Request, res: Response) {
    try {
        const { cod_us } = req.query;
        if (!cod_us || typeof cod_us !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Codigo de usuario invalido.'
            });
        }
        const user_created_events = await EventService.get_user_created_events(cod_us);
        return res.status(200).json({
            success: true,
            message: 'Eventos propios del usuario obtenidos satisfactoriamente.',
            data: user_created_events
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los eventos del usuario',
            error: (err as Error).message
        });
    }
}

export async function createEvent(req: Request, res: Response) {
    try {
        const { cod_us } = req.query;

        if (!cod_us || typeof cod_us !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Codigo de usuario invalido.'
            });
        }

        const {
            titulo_evento,
            descripcion_evento,
            fecha_inicio_evento,
            fecha_finalizacion_evento,
            tipo_evento,
            costo_inscripcion
        } = req.body;

        if (!titulo_evento || !descripcion_evento || !fecha_inicio_evento || !fecha_finalizacion_evento || !tipo_evento) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos del evento.'
            });
        }

        const banner_evento = req.file?.buffer || null;

        const cod_evento = await EventService.create_event({
            cod_us: parseInt(cod_us),
            titulo_evento,
            descripcion_evento,
            fecha_inicio_evento,
            fecha_finalizacion_evento,
            tipo_evento,
            banner_evento,
            costo_inscripcion: costo_inscripcion ? parseFloat(costo_inscripcion) : 0.0
        });

        return res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente.',
            data: { cod_evento }
        });
    } catch (err) {
        console.error("Error en createEvent:", err);
        return res.status(500).json({
            success: false,
            message: `Error al crear el evento: ${(err as Error).message}`,
            error: (err as Error).message
        });
    }
}

export async function getEventImage(req: Request, res: Response) {
    try {
        const { cod_evento } = req.params;

        if (!cod_evento) {
            return res.status(400).json({
                success: false,
                message: 'Codigo de evento invalido.'
            });
        }

        const banner_evento = await EventService.get_event_image(cod_evento);

        if (!banner_evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado o sin imagen.'
            });
        }

        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Length', banner_evento.length.toString());
        return res.send(banner_evento);
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener la imagen del evento',
            error: (err as Error).message
        });
    }
}