import { Request, Response } from 'express';
import { prisma } from '../../database';

// Crear nuevo intercambio
export const createExchange = async (req: Request, res: Response) => {
    try {
        const {
            cod_us_1,
            cod_us_2,
            cant_prod_origen,
            unidad_medida_origen,
            products_origen,
            products_destino,
            impacto_amb_inter
        } = req.body;

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

        const foto_inter = req.file?.buffer;

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

        res.status(201).json({
            success: true,
            message: 'Intercambio creado exitosamente',
            data: { cod_inter: result }
        });

    } catch (error: any) {
        console.error('❌ Error creating exchange:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el intercambio',
            error: error.message
        });
    }
};

// Obtener intercambios del usuario
export const getUserExchanges = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

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
            WHERE i.cod_us_1 = ${parseInt(userId)} OR i.cod_us_2 = ${parseInt(userId)}
            ORDER BY i.cod_inter DESC
        `;

        res.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('Error fetching user exchanges:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener intercambios',
            error: error.message
        });
    }
};

// Obtener intercambios por estado
export const getExchangesByStatus = async (req: Request, res: Response) => {
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

        res.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('Error fetching exchanges by status:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener intercambios',
            error: error.message
        });
    }
};

// Aceptar intercambio
export const acceptExchange = async (req: Request, res: Response) => {
    try {
        const { exchangeId } = req.params;

        res.json({
            success: true,
            message: 'Intercambio aceptado exitosamente'
        });

    } catch (error: any) {
        console.error('Error accepting exchange:', error);
        res.status(500).json({
            success: false,
            message: 'Error al aceptar el intercambio',
            error: error.message
        });
    }
};

// Rechazar intercambio
export const rejectExchange = async (req: Request, res: Response) => {
    try {
        const { exchangeId } = req.params;

        res.json({
            success: true,
            message: 'Intercambio rechazado'
        });

    } catch (error: any) {
        console.error('Error rejecting exchange:', error);
        res.status(500).json({
            success: false,
            message: 'Error al rechazar el intercambio',
            error: error.message
        });
    }
};

// Confirmar intercambio
export const confirmExchange = async (req: Request, res: Response) => {
    try {
        const { exchangeId } = req.params;

        res.json({
            success: true,
            message: 'Intercambio confirmado'
        });

    } catch (error: any) {
        console.error('Error confirming exchange:', error);
        res.status(500).json({
            success: false,
            message: 'Error al confirmar el intercambio',
            error: error.message
        });
    }
};

// Obtener detalles de un intercambio
export const getExchangeDetails = async (req: Request, res: Response) => {
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

        res.json({
            success: true,
            data: {
                ...exchange,
                productos: productsResult
            }
        });

    } catch (error: any) {
        console.error('Error fetching exchange details:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener detalles del intercambio',
            error: error.message
        });
    }
};

// Obtener imagen del intercambio
export const getExchangeImage = async (req: Request, res: Response) => {
    try {
        const { exchangeId } = req.params;

        const result: any[] = await prisma.$queryRaw`
            SELECT foto_inter FROM "intercambio" WHERE cod_inter = ${parseInt(exchangeId)}
        `;

        if (result.length === 0 || !result[0].foto_inter) {
            return res.status(404).json({
                success: false,
                message: 'Imagen no encontrada'
            });
        }

        const imageBuffer = result[0].foto_inter;
        res.set('Content-Type', 'image/jpeg');
        res.send(imageBuffer);

    } catch (error: any) {
        console.error('Error fetching exchange image:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la imagen',
            error: error.message
        });
    }
};
