import { Request, Response } from "express";
import path from 'path';
import fs from 'fs';
import * as ExchangeService from "../services/exchange.service";
import { ImageService } from "../services/image.service";
import { prisma } from '../../database';

export async function createExchange(req: Request, res: Response) {
    try {
        const {
            cod_us_1,
            cod_us_2,
            nom_prod,
            peso_prod,
            marca_prod,
            cod_subcat_prod,
            calidad_prod,
            desc_prod,
            cant_prod_origen,
            unidad_medida_origen,
            products_origen,
            products_destino,
            impacto_amb_inter
        } = req.body;

        // Determinar el tipo de intercambio: oferta abierta vs propuesta directa
        const isDirectProposal = cod_us_2 && (products_origen || products_destino);
        const isOpenOffer = !cod_us_2 && nom_prod;

        if (!isDirectProposal && !isOpenOffer) {
            return res.status(400).json({
                success: false,
                message: 'Debe ser una oferta abierta (con nom_prod) o una propuesta directa (con cod_us_2 y productos)'
            });
        }

        const foto_inter = req.file?.buffer;

        if (isOpenOffer) {
            // Validar campos para oferta abierta
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
            if (foto_inter) {
                const processed_image = await ImageService.processImage(foto_inter, {
                    width: 800,
                    height: 800,
                    quality: 85,
                    format: 'jpeg',
                });
                foto_inter_buffer = Buffer.from(processed_image);
            }

            // Crear intercambio (Oferta Abierta)
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
        } else {
            // Propuesta directa (Backend-Mateo)
            console.log('📦 Received exchange data:', {
                cod_us_1,
                cod_us_2,
                cant_prod_origen,
                unidad_medida_origen,
                products_origen,
                products_destino,
                impacto_amb_inter
            });

            // Parse products arrays
            const productosOrigen = JSON.parse(products_origen || '[]');
            const productosDestino = JSON.parse(products_destino || '[]');
            const allProducts = [...productosOrigen, ...productosDestino];

            // Validaciones
            if (!cod_us_1 || !cod_us_2) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren ambos usuarios para el intercambio'
                });
            }

            if (cod_us_1 === cod_us_2) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes crear un intercambio contigo mismo'
                });
            }

            if (!productosOrigen || productosOrigen.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debes seleccionar al menos un producto para ofrecer'
                });
            }

            if (!foto_inter) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere una foto del intercambio'
                });
            }

            // Usar transacción de Prisma
            const result = await prisma.$transaction(async (tx) => {
                // Insertar intercambio
                const exchangeResult: any[] = await tx.$queryRaw`
                    INSERT INTO "intercambio" (
                        cod_us_1, 
                        cod_us_2, 
                        cant_prod, 
                        unidad_medida, 
                        foto_inter, 
                        impacto_amb_inter
                    ) VALUES (
                        ${parseInt(cod_us_1)}, 
                        ${parseInt(cod_us_2)}, 
                        ${parseInt(cant_prod_origen) || allProducts.length}, 
                        ${unidad_medida_origen || 'unidades'}, 
                        ${foto_inter}, 
                        ${parseFloat(impacto_amb_inter) || 0.0}
                    )
                    RETURNING cod_inter
                `;

                const cod_inter = exchangeResult[0].cod_inter;

                // Insertar productos del intercambio
                for (const cod_prod of allProducts) {
                    if (cod_prod) {
                        await tx.$executeRaw`
                            INSERT INTO "intercambio_producto" (cod_inter, cod_prod) 
                            VALUES (${cod_inter}, ${parseInt(cod_prod)})
                        `;
                    }
                }

                return cod_inter;
            });

            console.log('✅ Exchange created successfully:', result);

            return res.status(201).json({
                success: true,
                message: 'Intercambio creado exitosamente',
                data: { cod_inter: result }
            });
        }
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
        const { userId } = req.params;

        const userCode = cod_us || userId;

        if (!userCode) {
            return res.status(400).json({
                success: false,
                message: 'Código de usuario requerido'
            });
        }

        const exchanges = await ExchangeService.get_user_exchanges(parseInt(userCode));

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
        const { exchangeId } = req.params;

        const exchangeCode = cod_inter || exchangeId;

        if (!exchangeCode) {
            return res.status(400).json({
                success: false,
                message: 'Código de intercambio requerido'
            });
        }

        const image = await ExchangeService.get_exchange_image(parseInt(exchangeCode));

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
        const { exchangeId } = req.params;
        const { cod_us } = req.body;

        const exchangeCode = cod_inter || exchangeId;

        if (!exchangeCode || !cod_us) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        const result = await ExchangeService.accept_exchange_proposal(parseInt(exchangeCode), cod_us);

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
        const { exchangeId } = req.params;
        const { cod_us } = req.body;

        const exchangeCode = cod_inter || exchangeId;

        if (!exchangeCode || !cod_us) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        const result = await ExchangeService.reject_exchange_proposal(parseInt(exchangeCode), cod_us);

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

// Funciones adicionales de Backend-Mateo
export async function getExchangesByStatus(req: Request, res: Response) {
    try {
        const { userId, status } = req.params;

        const result: any[] = await prisma.$queryRaw`
            SELECT 
                i.*,
                u1.nom_us as nombre_us_1,
                u1.handle_name as handle_us_1,
                u2.nom_us as nombre_us_2,
                u2.handle_name as handle_us_2
            FROM "intercambio" i
            LEFT JOIN "usuario" u1 ON i.cod_us_1 = u1.cod_us
            LEFT JOIN "usuario" u2 ON i.cod_us_2 = u2.cod_us
            WHERE (i.cod_us_1 = ${parseInt(userId)} OR i.cod_us_2 = ${parseInt(userId)})
            ORDER BY i.cod_inter DESC
        `;

        return res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error fetching exchanges by status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener intercambios',
            error: error.message
        });
    }
}

export async function acceptExchange(req: Request, res: Response) {
    try {
        const { exchangeId } = req.params;

        return res.json({
            success: true,
            message: 'Intercambio aceptado exitosamente'
        });
    } catch (error: any) {
        console.error('Error accepting exchange:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al aceptar el intercambio',
            error: error.message
        });
    }
}

export async function rejectExchange(req: Request, res: Response) {
    try {
        const { exchangeId } = req.params;

        return res.json({
            success: true,
            message: 'Intercambio rechazado'
        });
    } catch (error: any) {
        console.error('Error rejecting exchange:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al rechazar el intercambio',
            error: error.message
        });
    }
}

export async function confirmExchange(req: Request, res: Response) {
    try {
        const { exchangeId } = req.params;

        return res.json({
            success: true,
            message: 'Intercambio confirmado'
        });
    } catch (error: any) {
        console.error('Error confirming exchange:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al confirmar el intercambio',
            error: error.message
        });
    }
}

export async function getExchangeDetails(req: Request, res: Response) {
    try {
        const { exchangeId } = req.params;

        // Obtener datos del intercambio
        const exchangeResult: any[] = await prisma.$queryRaw`
            SELECT 
                i.*,
                u1.nom_us as nombre_us_1,
                u1.handle_name as handle_us_1,
                u2.nom_us as nombre_us_2,
                u2.handle_name as handle_us_2
            FROM "intercambio" i
            LEFT JOIN "usuario" u1 ON i.cod_us_1 = u1.cod_us
            LEFT JOIN "usuario" u2 ON i.cod_us_2 = u2.cod_us
            WHERE i.cod_inter = ${parseInt(exchangeId)}
        `;

        if (exchangeResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Intercambio no encontrado'
            });
        }

        // Obtener productos del intercambio
        const productsResult: any[] = await prisma.$queryRaw`
            SELECT p.*
            FROM "intercambio_producto" ip
            JOIN "producto" p ON ip.cod_prod = p.cod_prod
            WHERE ip.cod_inter = ${parseInt(exchangeId)}
        `;

        const exchange = exchangeResult[0];

        return res.json({
            success: true,
            data: {
                ...exchange,
                productos: productsResult
            }
        });
    } catch (error: any) {
        console.error('Error fetching exchange details:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener detalles del intercambio',
            error: error.message
        });
    }
}
