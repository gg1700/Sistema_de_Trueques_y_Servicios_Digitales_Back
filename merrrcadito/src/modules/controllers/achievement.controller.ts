import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export async function getAchievementLogo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result: any = await prisma.$queryRaw`
      SELECT icono_logro
      FROM logro
      WHERE cod_logro = ${parseInt(id)}
    `;
    const logro = result[0];
    if (!logro || !logro.icono_logro) {
      return res.status(404).json({
        success: false,
        message: 'Logo no encontrado',
      });
    }
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(logro.icono_logro);
  } catch (error) {
    res.status(500).json({
      success: false,
      error
    });
  }
}