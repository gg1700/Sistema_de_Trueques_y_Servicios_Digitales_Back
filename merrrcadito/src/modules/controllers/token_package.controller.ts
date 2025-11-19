import { Request, Response } from "express";
import * as TokenPackageService from "../services/token_package.service";
import { ImageService } from "../services/image.service";
import * as path from 'path';
import * as fs from 'fs';

const defaultImagePath = path.join(__dirname, '../../images/default_image.jpg');
const image_buffer = fs.readFileSync(defaultImagePath);
const hexa_string = image_buffer.toString('hex');

export async function registerTokenPackage(req: Request, res: Response) {
    try {
        const { nombre, tokens, precio_real } = req.body;
        let valid_image = null;
        if (!req.file) {
            valid_image = await ImageService.processImage(Buffer.from(hexa_string, 'hex'));
            if (!valid_image) {
                return res.status(400).json({ success: false, message: "Error al procesar la imagen por defecto" });
            }
            if (!nombre || typeof nombre !== 'string' || tokens === undefined || typeof tokens !== 'string' || precio_real === undefined || typeof precio_real !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: "Parámetros de cuerpo inválidos"
                });
            }
            const result = await TokenPackageService.register_token_package(nombre, tokens, precio_real, Buffer.from(valid_image));
            return res.status(200).json({
                success: true,
                message: result.message
            });
        }
        valid_image = await ImageService.processImage(req.file.buffer);
        if (!valid_image) {
            return res.status(400).json({ success: false, message: "Error al procesar la imagen subida" });
        }
        const processed_image = await ImageService.processImage(req.file.buffer, {
            width: 800,
            height: 800,
            quality: 85,
            format: 'jpeg',
        });
        const image_buffer = await Buffer.from(processed_image);
        if (!nombre || typeof nombre !== 'string' || tokens === undefined || typeof tokens !== 'string' || precio_real === undefined || typeof precio_real !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Parámetros de cuerpo inválidos"
            });
        }
        const result = await TokenPackageService.register_token_package(nombre, tokens, precio_real, image_buffer);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar el paquete de tokens: ',
            error: (error as Error).message
        });
    }
}

export async function getAllPackages(req: Request, res: Response) {
    try {
        const packages_data = await TokenPackageService.get_all_packages();
        if (!packages_data) {
            return res.status(400).json({
                success: false,
                message: 'No se encontraron datos para todos los paquetes de tokens registrados.',
                data: null
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Datos de todos los paquetes de tokens obtenidos exitosamente.',
            data: packages_data
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener la informacion de todos los paquetes de tokens',
            error: (err as Error).message
        });
    }
}

export async function getPackageImage(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).send("ID inválido");
        }

        const imageBuffer = await TokenPackageService.get_package_image(id);

        if (imageBuffer) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(imageBuffer);
        } else {
            if (fs.existsSync(defaultImagePath)) {
                res.setHeader('Content-Type', 'image/jpeg');
                fs.createReadStream(defaultImagePath).pipe(res);
            } else {
                res.status(404).send("Imagen no encontrada");
            }
        }
    } catch (error) {
        console.error("Error sirviendo imagen:", error);
        res.status(500).send("Error interno");
    }
}