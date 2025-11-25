import { Request, Response } from "express";
import * as EntrepreneurService from "../services/entrepreneur.service";
import { ImageService } from "../services/image.service";
import * as path from 'path';
import * as fs from 'fs';

const defaultImagePath = path.join(__dirname, '../../images/user_default_image.png');
const image_buffer = fs.readFileSync(defaultImagePath);
const hexa_string = image_buffer.toString('hex');

export async function registerEntrepreneur(req: Request, res: Response) {
    try {
        const attributes = req.body;
        const availabilitySlots = attributes.availability ? JSON.parse(attributes.availability) : [];

        let valid_image = null;
        if (!req.file) {
            valid_image = await ImageService.processImage(Buffer.from(hexa_string, 'hex'));
            if (!valid_image) {
                return res.status(400).json({ success: false, message: 'Error al procesar la imagen predeterminada.' });
            }
        } else {
            valid_image = await ImageService.processImage(req.file.buffer, {
                width: 800,
                height: 800,
                quality: 85,
                format: 'jpeg',
            });
        }

        const image_buffer_final = Buffer.from(valid_image);

        if (!attributes) {
            return res.status(400).json({ success: false, message: 'Datos incompletos para registrar el emprendedor.' });
        }

        const result = await EntrepreneurService.register_entrepreneur(
            attributes,
            image_buffer_final,
            availabilitySlots
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json({
            success: true,
            message: 'Emprendedor registrado correctamente.',
            data: result.data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar el emprendedor: ',
            error: (error as Error).message
        });
    }
}
