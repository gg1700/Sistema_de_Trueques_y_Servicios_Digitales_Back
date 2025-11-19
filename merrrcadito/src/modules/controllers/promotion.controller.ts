import 'express';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as PromotionService from '../services/promotion.service';

const prisma = new PrismaClient();

export async function registrarPromocion(req: Request, res: Response) {
    try {
        const promocionData = req.body;
        if (!promocionData || Object.keys(promocionData).length === 0) {
            return res.status(400).json({ success: false, message: 'Error al crear promocion: Datos de promocion incompletos.' });
        }
        const result = await PromotionService.registrar_promocion(promocionData);
        if (!result) {
            return res.status(400).json({
                success: false,
                message: 'Error al crear la promocion, ya existe una promocion con esos datos.'
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'La promocion se ha creado exitosamente.'
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al registrar promocion: ', error: (err as Error).message
        });
    }
}

export async function getPromotionBanner(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result: any = await prisma.$queryRaw`
        SELECT banner_prom 
        FROM promocion 
        WHERE cod_prom = ${parseInt(id)}
    `;
    const promotion = result[0];
    if (!promotion || !promotion.logo_org) {
      return res.status(404).json({
        success: false,
        message: 'Banner no encontrado',
      });
    }
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(promotion.logo_org);
  } catch (error) {
    res.status(500).json({
      success: false,
      error
    });
  }
}