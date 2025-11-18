import { Request, Response } from "express";
import * as OrganizationService from "../services/organization.service";
import { ImageService } from "../services/image.service";
import * as path from 'path';
import * as fs from 'fs';

const defaultImagePath = path.join(__dirname, '../../images/user_default_image.png');
const image_buffer = fs.readFileSync(defaultImagePath);
const hexa_string = image_buffer.toString('hex');

export async function registerOrganization(req: Request, res: Response) {
    try {
        const attributes = req.body;
        let valid_image = null;
        if (!req.file) {
            valid_image = await ImageService.processImage(Buffer.from(hexa_string, 'hex'));
            if (!valid_image) {
                return res.status(400).json({ success: false, message: 'Error al procesar la imagen predeterminada.' });
            }
            if (!attributes) {
                return res.status(400).json({ success: false, message: 'Datos incompletos para registrar la organización.' });
            }
            const result = await OrganizationService.register_organization(attributes, Buffer.from(valid_image));
            if(result.message === 'El nombre de la organización ya existe.') {
                return res.status(400).json(result);
            }
            return res.status(201).json({ 
                success: true, 
                message: 'Organización registrada correctamente con imagen predeterminada.', 
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
            format: 'png',
        });
        const image_buffer = await Buffer.from(processed_image);
        if (!attributes) {
            return res.status(400).json({ success: false, message: 'Datos incompletos para registrar la organización.' });
        }
        const result = await OrganizationService.register_organization(attributes, image_buffer);
        if(result.message === 'El nombre de la organización ya existe.') {
            return res.status(400).json(result);
        }
        return res.status(201).json({ 
            success: true, 
            message: 'Organización registrada correctamente.', 
            data: result 
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar la organización: ',
            error: (err as Error).message
        });
    }
}

export async function getOrganizationData(req: Request, res: Response) {
    try {
        const { nom_leg_org, cif } = req.query;
        if (!nom_leg_org || typeof nom_leg_org !== 'string' || !cif || typeof cif !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Parámetros de consulta inválidos.' 
            });
        }
        const result = await OrganizationService.get_organization_data(nom_leg_org, cif);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron datos para la organización proporcionada.',
                data: null
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Datos de la organización obtenidos correctamente.',
            data: result
        });
    }catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los datos de la organización: ',
            error: (err as Error).message
        });
    }
}