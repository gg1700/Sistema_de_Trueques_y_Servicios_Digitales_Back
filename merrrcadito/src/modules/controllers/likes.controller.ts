import { Request, Response } from "express";
import * as likesService from "../services/likes.service";

/**
 * Agregar un me gusta a una publicación
 */
export async function addLike(req: Request, res: Response) {
    try {
        const { cod_us, cod_pub } = req.body;

        if (!cod_us || !cod_pub) {
            return res.status(400).json({
                success: false,
                message: "cod_us y cod_pub son requeridos",
            });
        }

        const result = await likesService.addLike(
            parseInt(cod_us),
            parseInt(cod_pub)
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (err: any) {
        console.error("Error en addLike controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al agregar me gusta",
            error: err.message,
        });
    }
}

/**
 * Eliminar un me gusta de una publicación
 */
export async function removeLike(req: Request, res: Response) {
    try {
        const { cod_us, cod_pub } = req.body;

        if (!cod_us || !cod_pub) {
            return res.status(400).json({
                success: false,
                message: "cod_us y cod_pub son requeridos",
            });
        }

        const result = await likesService.removeLike(
            parseInt(cod_us),
            parseInt(cod_pub)
        );

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (err: any) {
        console.error("Error en removeLike controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al eliminar me gusta",
            error: err.message,
        });
    }
}

/**
 * Obtener todos los likes de un usuario
 */
export async function getUserLikes(req: Request, res: Response) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId es requerido",
            });
        }

        const result = await likesService.getUserLikes(parseInt(userId));

        return res.status(200).json(result);
    } catch (err: any) {
        console.error("Error en getUserLikes controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al obtener me gustas del usuario",
            error: err.message,
        });
    }
}

/**
 * Verificar si un usuario le dio like a una publicación
 */
export async function checkUserLike(req: Request, res: Response) {
    try {
        const { userId, publicationId } = req.params;

        if (!userId || !publicationId) {
            return res.status(400).json({
                success: false,
                message: "userId y publicationId son requeridos",
            });
        }

        const result = await likesService.checkUserLike(
            parseInt(userId),
            parseInt(publicationId)
        );

        return res.status(200).json(result);
    } catch (err: any) {
        console.error("Error en checkUserLike controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al verificar me gusta",
            error: err.message,
        });
    }
}

/**
 * Obtener el conteo de likes de una publicación
 */
export async function getPublicationLikesCount(req: Request, res: Response) {
    try {
        const { publicationId } = req.params;

        if (!publicationId) {
            return res.status(400).json({
                success: false,
                message: "publicationId es requerido",
            });
        }

        const result = await likesService.getPublicationLikesCount(
            parseInt(publicationId)
        );

        return res.status(200).json(result);
    } catch (err: any) {
        console.error("Error en getPublicationLikesCount controller:", err);
        return res.status(500).json({
            success: false,
            message: "Error al obtener conteo de me gustas",
            error: err.message,
        });
    }
}
