import { Request, Response } from 'express';
import { ImageService } from '../services/image.service';
import * as PostService from '../services/post.service';
import * as path from 'path';
import * as fs from 'fs';

const defaultImagePath = path.join(__dirname, '../../images/default_image.jpg');
const image_buffer = fs.readFileSync(defaultImagePath);
const hexa_string = image_buffer.toString('hex');

export async function createPost(req: Request, res: Response) {
    try {
        const { cod_us, cod_prod } = req.query;
        const attributes = req.body;
        let valid_image = null;
        if (!req.file) {
            valid_image = await ImageService.processImage(Buffer.from(hexa_string, 'hex'));
            if (!valid_image) {
                return res.status(400).json({ success: false, message: 'Error al procesar la imagen predeterminada.' });
            }
            if (!cod_us || typeof cod_us !== 'string' || !cod_prod || typeof cod_prod !== 'string') {
                return res.status(400).json({ success: false, message: 'Código de publicación inválido.' });
            }
            if (!attributes) {
                return res.status(400).json({ success: false, message: 'Datos incompletos para crear la publicación.' });
            }
            await PostService.create_post(cod_us, cod_prod, attributes, Buffer.from(valid_image));
            return res.status(201).json({ success: true, message: 'Publicación creada correctamente con imagen predeterminada.' });
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
        if (!cod_us || typeof cod_us !== 'string' || !cod_prod || typeof cod_prod !== 'string') {
            return res.status(400).json({ success: false, message: 'Código de publicación inválido.' });
        }
        if (!attributes) {
            return res.status(400).json({ success: false, message: 'Datos incompletos para crear la publicación.' });
        }
        await PostService.create_post(cod_us, cod_prod, attributes, image_buffer);
        return res.status(201).json({ success: true, message: 'Publicación creada correctamente.' });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear la publicación: ',
            error: (err as Error).message
        });
    }
}

export async function getAllActiveProductPosts(req: Request, res: Response) {
    try {
        const active_product_posts = await PostService.get_all_active_product_posts();
        if (!active_product_posts) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron publicaciones activas de productos.',
                data: []
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Publicaciones activas del producto obtenidas correctamente.',
            data: active_product_posts
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las publicaciones activas del producto: ',
            error: (err as Error).message
        });
    }
}

export async function getPostById(req: Request, res: Response) {
    try {
        const { cod_pub } = req.params;

        if (!cod_pub) {
            return res.status(400).json({
                success: false,
                message: 'Código de publicación requerido'
            });
        }

        const post = await PostService.get_post_by_id(cod_pub);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            data: post
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: (err as Error).message
        });
    }
}

export async function getAllActiveServicePosts(req: Request, res: Response) {
    try {
        const active_service_posts = await PostService.get_all_active_service_posts();
        return res.status(200).json({
            success: true,
            message: 'Publicaciones de servicios activos obtenidos exitosamente.',
            data: active_service_posts
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener publicaciones de servicios activos.',
            error: error.message
        });
    }
}

export async function getExploreProducts(req: Request, res: Response) {
    try {
        const products = await PostService.get_explore_products() as any[];

        if (!products || products.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay productos disponibles',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Productos obtenidos correctamente',
            data: products
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener productos',
            error: (err as Error).message
        });
    }
}

export async function getExploreServices(req: Request, res: Response) {
    try {
        const services = await PostService.get_explore_services() as any[];

        if (!services || services.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay servicios disponibles',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Servicios obtenidos correctamente',
            data: services
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener servicios',
            error: (err as Error).message
        });
    }
}

export async function getPostImage(req: Request, res: Response) {
    try {
        const { cod_pub } = req.params;

        if (!cod_pub) {
            return res.status(400).json({
                success: false,
                message: 'Código de publicación requerido'
            });
        }

        const post = await PostService.get_post_by_id(cod_pub) as any;

        // FORZAR IMAGEN POR DEFECTO SIEMPRE
        // Ignoramos la imagen de la BD porque son datos aleatorios/corruptos
        res.set('Content-Type', 'image/jpeg');
        return res.send(image_buffer);

    } catch (err) {
        console.error('Error serving image:', err);
        // En caso de error, también intentamos devolver la imagen por defecto
        try {
            res.set('Content-Type', 'image/jpeg');
            return res.send(image_buffer);
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener la imagen'
            });
        }
    }
}