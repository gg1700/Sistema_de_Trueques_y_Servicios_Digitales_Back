import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { ImageService } from "../services/image.service";
import * as path from 'path';
import * as fs from 'fs';

const defaultImagePath = path.join(__dirname, '../../images/user_default_image.png');
const image_buffer = fs.readFileSync(defaultImagePath);
const hexa_string = image_buffer.toString('hex');

export async function getUsersActivityReportByWeek(req: Request, res: Response) {
    try {
        const week_report = await UserService.get_users_activity_report_by_week();
        if (!week_report) {
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
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de actividad de usuarios por semana: ',
            error: (error as Error).message
        });
    }
}

export async function getUsersActivityReportByMonth(req: Request, res: Response) {
    try {
        const month_report = await UserService.get_user_activity_report_by_month();
        if (!month_report) {
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
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de actividad de usuarios por mes: ',
            error: (error as Error).message
        });
    }
}

export async function registerUser(req: Request, res: Response) {
    try {
        const attributes = req.body;
        let valid_image = null;
        if (!req.file) {
            valid_image = await ImageService.processImage(Buffer.from(hexa_string, 'hex'));
            if (!valid_image) {
                return res.status(400).json({ success: false, message: 'Error al procesar la imagen predeterminada.' });
            }
            if (!attributes) {
                return res.status(400).json({ success: false, message: 'Datos incompletos para registrar el usuario.' });
            }
            const result = await UserService.register_user(attributes, Buffer.from(valid_image));
            if (result.message === 'El handle name ya existe.') {
                return res.status(400).json(result);
            }
            return res.status(201).json({
                success: true,
                message: 'Usuario registrado correctamente con imagen predeterminada.',
                data: result
            });
        }
        valid_image = await ImageService.processImage(req.file.buffer);
        if (!valid_image) {
            return res.status(400).json({ success: false, message: 'Error al procesar la imagen.' });
        }
        const processed_image = await ImageService.processImage(req.file.buffer, {
            width: 800,
            height: 800,
            quality: 85,
            format: 'jpeg',
        });
        const image_buffer = await Buffer.from(processed_image);
        if (!attributes) {
            return res.status(400).json({ success: false, message: 'Datos incompletos para registrar el usuario.' });
        }
        const result = await UserService.register_user(attributes, image_buffer);
        if (result.message === 'El handle name ya existe.') {
            return res.status(400).json(result);
        }
        return res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente.',
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar el usuario: ',
            error: (error as Error).message
        });
    }
}

export async function getUserData(req: Request, res: Response) {
    try {
        const { handle_name } = req.query;
        if (!handle_name || typeof handle_name !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Handle name inválido.'
            });
        }
        const user_data = await UserService.get_user_data(handle_name);
        if (!user_data) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron datos para el usuario especificado.',
                data: null
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Datos del usuario obtenidos exitosamente.',
            data: user_data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los datos del usuario: ',
            error: (error as Error).message
        });
    }
}

export async function getUserPosts(req: Request, res: Response) {
    try{
        const { cod_us } = req.query;
        if (!cod_us || typeof cod_us !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Código de usuario inválido.'
            });
        }
        const user_posts = await UserService.get_user_posts(cod_us);
        if (!user_posts) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron publicaciones para el usuario especificado.',
                data: []
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Publicaciones del usuario obtenidas exitosamente.',
            data: user_posts
        });
    }catch(err){
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las publicaciones del usuario: ',
            error: (err as Error).message
        });
    }
}

export async function getRankingUsersByCO2(req: Request, res: Response) {
    try {
        const ranking_users_co2 = await UserService.get_ranking_users_by_co2();
        if (!ranking_users_co2) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el ranking de usuarios por CO2.',
                data: []
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Ranking de usuarios por CO2 obtenido exitosamente.',
            data: ranking_users_co2
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el ranking de usuarios por CO2: ',
            error: (error as Error).message
        });
    }
}

export async function getRankingUsersBySells(req: Request, res: Response) {
    try {

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el ranking de vendedores por ventas.',
            error: (err as Error).message
        });
    }
}