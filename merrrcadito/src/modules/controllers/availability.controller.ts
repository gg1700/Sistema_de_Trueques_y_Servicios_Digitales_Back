import { Request, Response } from "express";
import * as AvailabilityService from "../services/availability.service";

/**
 * Crea o actualiza la disponibilidad de un emprendedor
 */
export async function createAvailability(req: Request, res: Response) {
    try {
        const { cod_us, slots } = req.body;

        if (!cod_us || !slots || !Array.isArray(slots)) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos. Se requiere cod_us y slots (array).'
            });
        }

        // Validar formato de slots
        for (const slot of slots) {
            if (
                typeof slot.day_of_week !== 'number' ||
                slot.day_of_week < 0 ||
                slot.day_of_week > 6 ||
                !slot.start_time ||
                !slot.end_time
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de slot inválido. Cada slot debe tener day_of_week (0-6), start_time y end_time.'
                });
            }
        }

        const result = await AvailabilityService.create_entrepreneur_availability(
            parseInt(cod_us),
            slots
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear disponibilidad: ',
            error: (error as Error).message
        });
    }
}

/**
 * Obtiene la disponibilidad de un emprendedor
 */
export async function getAvailability(req: Request, res: Response) {
    try {
        const { handle_name } = req.params;

        if (!handle_name) {
            return res.status(400).json({
                success: false,
                message: 'Handle name es requerido.'
            });
        }

        const result = await AvailabilityService.get_entrepreneur_availability(handle_name);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener disponibilidad: ',
            error: (error as Error).message
        });
    }
}

/**
 * Actualiza la disponibilidad de un emprendedor
 */
export async function updateAvailability(req: Request, res: Response) {
    try {
        const { cod_us, slots } = req.body;

        if (!cod_us || !slots || !Array.isArray(slots)) {
            return res.status(400).json({
                success: false,
                message: 'Datos incompletos. Se requiere cod_us y slots (array).'
            });
        }

        const result = await AvailabilityService.update_entrepreneur_availability(
            parseInt(cod_us),
            slots
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar disponibilidad: ',
            error: (error as Error).message
        });
    }
}

/**
 * Elimina un slot específico de disponibilidad
 */
export async function deleteAvailabilitySlot(req: Request, res: Response) {
    try {
        const { cod_disp } = req.params;

        if (!cod_disp) {
            return res.status(400).json({
                success: false,
                message: 'cod_disp es requerido.'
            });
        }

        const result = await AvailabilityService.delete_availability_slot(parseInt(cod_disp));

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar slot de disponibilidad: ',
            error: (error as Error).message
        });
    }
}
