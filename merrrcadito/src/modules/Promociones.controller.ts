import { Request, Response } from 'express';
import 'express';
import {
    registrar_promocion
} from './Promociones.service';

export async function registrarPromocion(req: Request, res: Response) {
    try {
        const promocionData = req.body;
        if (!promocionData || Object.keys(promocionData).length === 0) {
            return res.status(400).json({ success: false, message: 'Error al crear promocion: Datos de promocion incompletos.' });
        }
        const result = await registrar_promocion(promocionData);
        if (!result) {
            return res.status(400).json({
                success: false,
                message: 'Error al crear la promocion, ya existe una promocion con esos datos.'
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'La promocion se ha creado exitosamente.'
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar promocion: ', error: (err as Error).message
        });
    }
}