import { Request, Response } from "express";
import path from 'path';
import fs from 'fs';
import * as ExchangeService from "../services/exchange.service";
import { ImageService } from "../services/image.service";

export async function createExchange(req: Request, res: Response) {
    try {
        const {
            cod_us_1,
            nom_prod,
            peso_prod,
            marca_prod,
            cod_subcat_prod,
            calidad_prod,
            desc_prod,
            cant_prod_origen,
            unidad_medida_origen
        } = req.body;

        // Validar campos requeridos para oferta abierta y creación de producto
        if (!cod_us_1 || !nom_prod || !cod_subcat_prod) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: usuario, nombre de producto, subcategoría'
            });
        }

        if (!cant_prod_origen || !unidad_medida_origen) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: cantidad y unidad de origen'
            });
        }

        // Procesar imagen si existe
        let foto_inter_buffer: Buffer | undefined;
        if (req.file) {
            const processed_image = await ImageService.processImage(req.file.buffer, {
                width: 800,
                height: 800,
                quality: 85,
                format: 'jpeg',
            });
            foto_inter_buffer = Buffer.from(processed_image);
        }

        // Crear intercambio (Oferta Abierta con creación de producto)
        const result = await ExchangeService.create_exchange({
            cod_us_1: parseInt(cod_us_1),
            nom_prod,
            peso_prod: parseFloat(peso_prod || "0"),
            marca_prod,
            cod_subcat_prod: parseInt(cod_subcat_prod),
            calidad_prod,
            desc_prod,
            cant_prod_origen: parseInt(cant_prod_origen),
            unidad_medida_origen,
            foto_inter: foto_inter_buffer
        });

        return res.status(201).json({
            success: true,
            message: 'Oferta de intercambio creada exitosamente',
            data: result
        });
    } catch (error) {
        console.error('Error en createExchange:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear el intercambio',
            error: (error as Error).message
        });
    }
}

export async function getUserExchanges(req: Request, res: Response) {
    try {
        const { cod_us } = req.params;

        if (!cod_us) {
            return res.status(400).json({
                success: false,
                message: 'Código de usuario requerido'
            });
        }

        const exchanges = await ExchangeService.get_user_exchanges(parseInt(cod_us));

        return res.status(200).json({
            success: true,
            message: 'Intercambios obtenidos exitosamente',
            data: exchanges
        });
    } catch (error) {
        console.error('Error en getUserExchanges:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los intercambios',
            error: (error as Error).message
        });
    }
}

export async function getUserExchangeHistory(req: Request, res: Response) {
    try {
        const { cod_us } = req.query;

        if (!cod_us) {
            return res.status(400).json({
                success: false,
                message: 'Código de usuario requerido'
            });
        }

        const exchanges = await ExchangeService.get_user_exchanges(parseInt(cod_us as string));

        return res.status(200).json({
            success: true,
            message: 'Historial de intercambios obtenido exitosamente',
            data: exchanges
        });
    } catch (error) {
        console.error('Error en getUserExchangeHistory:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de intercambios',
            error: (error as Error).message
        });
    }
}

export async function getExchangeImage(req: Request, res: Response) {
    try {
        const { cod_inter } = req.params;

        if (!cod_inter) {
            return res.status(400).json({
                success: false,
                message: 'Código de intercambio requerido'
            });
        }

        const image = await ExchangeService.get_exchange_image(parseInt(cod_inter));

        if (!image) {
            const defaultImagePath = path.join(__dirname, '../../images/default_image.jpg');
            if (fs.existsSync(defaultImagePath)) {
                res.setHeader('Content-Type', 'image/jpeg');
                return res.sendFile(defaultImagePath);
            }

            return res.status(404).json({
                success: false,
                message: 'Imagen no encontrada'
            });
        }

        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(image);
    } catch (error) {
        console.error('Error en getExchangeImage:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener la imagen del intercambio',
            error: (error as Error).message
        });
    }
}

export async function proposeExchange(req: Request, res: Response) {
    try {
        const { cod_inter } = req.params;
        const {
            cod_us_2,
            nom_prod,
            peso_prod,
            marca_prod,
            cod_subcat_prod,
            calidad_prod,
            desc_prod,
            cant_prod_destino,
            unidad_medida_destino
        } = req.body;

        if (!cod_inter || !cod_us_2 || !nom_prod) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        const result = await ExchangeService.proposeExchange({
            cod_inter: parseInt(cod_inter),
            cod_us_2,
            nom_prod,
            peso_prod: parseFloat(peso_prod) || 0,
            marca_prod: marca_prod || '',
            cod_subcat_prod: parseInt(cod_subcat_prod),
            calidad_prod,
            desc_prod: desc_prod || '',
            cant_prod_destino: parseInt(cant_prod_destino),
            unidad_medida_destino,
            foto_prod: req.file?.buffer
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en proposeExchange:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar la propuesta',
            error: (error as Error).message
        });
    }
}

export async function getAllOpenExchanges(req: Request, res: Response) {
    try {
        const exchanges = await ExchangeService.get_all_open_exchanges();

        return res.status(200).json({
            success: true,
            message: 'Intercambios abiertos obtenidos exitosamente',
            data: exchanges
        });
    } catch (error) {
        console.error('Error en getAllOpenExchanges:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los intercambios abiertos',
            error: (error as Error).message
        });
    }
}

export async function getPendingExchangeRequests(req: Request, res: Response) {
    try {
        const { cod_us } = req.query;

        if (!cod_us) {
            return res.status(400).json({
                success: false,
                message: 'Código de usuario requerido'
            });
        }

        const pendingRequests = await ExchangeService.get_pending_exchange_requests(parseInt(cod_us as string));

        return res.status(200).json({
            success: true,
            message: 'Solicitudes pendientes obtenidas exitosamente',
            data: pendingRequests
        });
    } catch (error) {
        console.error('Error en getPendingExchangeRequests:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las solicitudes pendientes',
            error: (error as Error).message
        });
    }
}

export async function acceptExchangeProposal(req: Request, res: Response) {
    try {
        const { cod_inter } = req.params;
        const { cod_us } = req.body;

        if (!cod_inter || !cod_us) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        const result = await ExchangeService.accept_exchange_proposal(parseInt(cod_inter), cod_us);

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en acceptExchangeProposal:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al aceptar la propuesta',
            error: (error as Error).message
        });
    }
}

export async function rejectExchangeProposal(req: Request, res: Response) {
    try {
        const { cod_inter } = req.params;
        const { cod_us } = req.body;

        if (!cod_inter || !cod_us) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        const result = await ExchangeService.reject_exchange_proposal(parseInt(cod_inter), cod_us);

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en rejectExchangeProposal:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al rechazar la propuesta',
            error: (error as Error).message
        });
    }
}
