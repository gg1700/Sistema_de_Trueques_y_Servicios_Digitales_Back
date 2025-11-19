import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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