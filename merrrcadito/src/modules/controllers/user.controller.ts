import { Request, Response } from "express";
import * as UserService from "../services/user.service";

export async function getUsersActivityReportByWeek(req: Request, res: Response) {
    try{
        const week_report = await UserService.get_users_activity_report_by_week();
        if(!week_report){
            return res.status(404).json({
                success: false,
                message: 'No se encontró el reporte de actividad de usuarios por semana.',
                data: []
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Reporte de actividad de usuarios por semana obtenido exitosamente.',
            data: week_report
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de actividad de usuarios por semana: ',
            error: (error as Error).message
        });
    }
}

export async function getUsersActivityReportByMonth(req: Request, res: Response) {
    try{
        const month_report = await UserService.get_user_activity_report_by_month();
        if(!month_report){
            return res.status(404).json({
                success: false,
                message: 'No se encontró el reporte de actividad de usuarios por mes.',
                data: []
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Reporte de actividad de usuarios por mes obtenido exitosamente.',
            data: month_report
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de actividad de usuarios por mes: ',
            error: (error as Error).message
        });
    }
}