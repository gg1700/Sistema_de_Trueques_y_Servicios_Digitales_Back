import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as PublicationService from '../services/publication.service';

const prisma = new PrismaClient();

export async function getPublicacionPhoto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result: any = await prisma.$queryRaw`
      SELECT foto_pub
      FROM publicacion
      WHERE cod_pub = ${parseInt(id)};
    `;
    const publicacion = result[0];
    if (!publicacion || !publicacion.foto_pub) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada',
      });
    }
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(publicacion.foto_pub);
  } catch (error) {
    res.status(500).json({
      success: false,
      error
    });
  }
}

/**
 * Obtener publicaciones de un usuario
 */
export async function getUserPublications(req: Request, res: Response) {
  try {
    const cod_us = parseInt(req.params.cod_us);

    if (isNaN(cod_us)) {
      return res.status(400).json({
        success: false,
        message: 'El código de usuario debe ser un número válido'
      });
    }

    const publications = await PublicationService.getUserPublications(cod_us);

    return res.status(200).json({
      success: true,
      data: publications,
      message: 'Publicaciones obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error en getUserPublications controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener publicaciones del usuario',
      error: (error as Error).message
    });
  }
}