import { Request, Response } from "express";
import * as eventEnrollmentService from "../services/event-enrollment.service";

/**
 * Obtener eventos inscritos de un usuario
 */
export async function getUserEnrolledEvents(req: Request, res: Response) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId es requerido",
            });
        }

        const result = await eventEnrollmentService.getUserEnrolledEvents(
            parseInt(userId)
        );

        return res.status(200).json(result);
    } catch (err: any) {
        console.error("Error en getUserEnrolledEvents controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al obtener eventos inscritos",
            error: err.message,
        });
    }
}

/**
 * Inscribir usuario en un evento
 */
export async function enrollUserInEvent(req: Request, res: Response) {
    try {
        const { cod_us, cod_evento } = req.body;

        if (!cod_us || !cod_evento) {
            return res.status(400).json({
                success: false,
                message: "cod_us y cod_evento son requeridos",
            });
        }

        const result = await eventEnrollmentService.enrollUserInEvent(
            parseInt(cod_us),
            parseInt(cod_evento)
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (err: any) {
        console.error("Error en enrollUserInEvent controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al inscribir en evento",
            error: err.message,
        });
    }
}

/**
 * Desinscribir usuario de un evento
 */
export async function unenrollUserFromEvent(req: Request, res: Response) {
    try {
        const { cod_us, cod_evento } = req.body;

        if (!cod_us || !cod_evento) {
            return res.status(400).json({
                success: false,
                message: "cod_us y cod_evento son requeridos",
            });
        }

        const result = await eventEnrollmentService.unenrollUserFromEvent(
            parseInt(cod_us),
            parseInt(cod_evento)
        );

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (err: any) {
        console.error("Error en unenrollUserFromEvent controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al desinscribir de evento",
            error: err.message,
        });
    }
}

/**
 * Verificar si usuario está inscrito en evento
 */
export async function checkUserEnrollment(req: Request, res: Response) {
    try {
        const { userId, eventId } = req.params;

        if (!userId || !eventId) {
            return res.status(400).json({
                success: false,
                message: "userId y eventId son requeridos",
            });
        }

        const result = await eventEnrollmentService.checkUserEnrollment(
            parseInt(userId),
            parseInt(eventId)
        );

        return res.status(200).json(result);
    } catch (err: any) {
        console.error("Error en checkUserEnrollment controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al verificar inscripción",
            error: err.message,
        });
    }
}
