import { Request, Response } from 'express';
import { prisma } from '../../database';

export async function getAllUsers(req: Request, res: Response) {
    try {
        const users: any = await prisma.$queryRaw`
            SELECT cod_us, handle_name, nom_us, ap_pat_us, ap_mat_us, correo_us
            FROM usuario
            ORDER BY nom_us ASC
        `;

        return res.status(200).json({
            success: true,
            message: 'Usuarios obtenidos exitosamente.',
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios: ',
            error: (error as Error).message
        });
    }
}

export async function getUserProducts(req: Request, res: Response) {
    try {
        const { userId } = req.params;
        console.log('Getting products for userId:', userId);

        // Get products with their publication details
        const products: any = await prisma.$queryRaw`
            SELECT 
                p.cod_prod, 
                p.nom_prod, 
                p.desc_prod,
                pp.cant_prod,
                pp.unidad_medida
            FROM producto p
            INNER JOIN publicacion_producto pp ON p.cod_prod = pp.cod_prod
            INNER JOIN publicacion pub ON pp.cod_pub = pub.cod_pub
            WHERE pub.cod_us = ${parseInt(userId)}
        `;

        console.log('Products found:', products.length);
        console.log('Products:', JSON.stringify(products, null, 2));

        return res.status(200).json({
            success: true,
            message: 'Productos obtenidos exitosamente.',
            data: products
        });
    } catch (error) {
        console.error('Error getting products:', error);
        console.error('Error stack:', (error as Error).stack);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener productos: ',
            error: (error as Error).message
        });
    }
}
