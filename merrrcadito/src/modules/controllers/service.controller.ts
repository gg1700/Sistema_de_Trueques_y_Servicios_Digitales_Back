import { Request, Response } from "express";
import * as serviceService from "../services/service.service";

export async function createService(req: Request, res: Response) {
    try {
        const {
            cod_cat,
            nom_serv,
            desc_serv,
            precio_serv,
            duracion_serv,
            dif_dist_serv,
            cod_us,
            hrs_ini_dia_serv,
            hrs_fin_dia_serv,
        } = req.body;

        // Validaciones básicas
        if (!cod_cat || !nom_serv || !precio_serv || !cod_us) {
            return res.status(400).json({
                success: false,
                message: "Faltan campos obligatorios",
            });
        }

        const result = await serviceService.createService({
            cod_cat,
            nom_serv,
            desc_serv,
            precio_serv,
            duracion_serv,
            dif_dist_serv: dif_dist_serv || 0,
            cod_us,
            hrs_ini_dia_serv: hrs_ini_dia_serv || "08:00",
            hrs_fin_dia_serv: hrs_fin_dia_serv || "18:00",
        });

        return res.status(201).json(result);
    } catch (err: any) {
        console.error("Error en createService controller:", err);

        // Detectar error de clave duplicada (nombre de servicio ya existe)
        if (err.message && err.message.includes('23505')) {
            return res.status(409).json({
                success: false,
                message: "Ya existe un servicio con ese nombre. Por favor, elige un nombre diferente.",
                error: "DUPLICATE_SERVICE_NAME",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error al crear servicio",
            error: err.message,
        });
    }
}

export async function getUserServices(req: Request, res: Response) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId es requerido",
            });
        }

        const result = await serviceService.getUserServices(parseInt(userId));

        return res.status(200).json(result);
    } catch (err: any) {
        console.error("Error en getUserServices controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al obtener servicios",
            error: err.message,
        });
    }
}
