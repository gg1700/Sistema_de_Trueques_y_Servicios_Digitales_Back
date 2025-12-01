import { Request, Response } from 'express';
import * as PromotionService from '../services/promotion.service';

/**
 * Crear una nueva promoción
 * Recibe multipart/form-data con imagen
 */
export async function createPromotion(req: Request, res: Response) {
  try {
    // Validar que se recibió una imagen
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'El banner de la promoción es requerido'
      });
    }

    // Parsear campos numéricos (vienen como string en multipart/form-data)
    const descuento_prom = parseFloat(req.body.descuento_prom);

    // Validaciones
    if (!req.body.titulo_prom || !req.body.fecha_ini_prom || !req.body.fecha_fin_prom || !req.body.descr_prom) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    if (isNaN(descuento_prom) || descuento_prom < 0 || descuento_prom > 100) {
      return res.status(400).json({
        success: false,
        message: 'El descuento debe ser un número entre 0 y 100'
      });
    }

    // Validar fechas
    const fechaIni = new Date(req.body.fecha_ini_prom);
    const fechaFin = new Date(req.body.fecha_fin_prom);

    if (fechaFin <= fechaIni) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
    }

    const promotionData = {
      titulo_prom: req.body.titulo_prom,
      fecha_ini_prom: req.body.fecha_ini_prom,
      fecha_fin_prom: req.body.fecha_fin_prom,
      descr_prom: req.body.descr_prom,
      banner_prom: req.file.buffer, // Buffer directo de Multer
      descuento_prom: descuento_prom
    };

    const result = await PromotionService.createPromotion(promotionData);
    return res.status(201).json(result);

  } catch (error) {
    console.error('Error en createPromotion controller:', error);
    return res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
}

/**
 * Vincular una promoción a una publicación
 */
export async function linkPromotion(req: Request, res: Response) {
  try {
    const { cod_prom, cod_pub, cod_us } = req.body;

    // Validaciones
    if (!cod_prom || !cod_pub || !cod_us) {
      return res.status(400).json({
        success: false,
        message: 'cod_prom, cod_pub y cod_us son requeridos'
      });
    }

    // Parsear a números
    const data = {
      cod_prom: parseInt(cod_prom),
      cod_pub: parseInt(cod_pub),
      cod_us: parseInt(cod_us)
    };

    if (isNaN(data.cod_prom) || isNaN(data.cod_pub) || isNaN(data.cod_us)) {
      return res.status(400).json({
        success: false,
        message: 'Los códigos deben ser números válidos'
      });
    }

    const result = await PromotionService.linkPromotionToPublication(data);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error en linkPromotion controller:', error);
    return res.status(400).json({
      success: false,
      message: (error as Error).message
    });
  }
}

/**
 * Desvincular una promoción de una publicación
 */
export async function unlinkPromotion(req: Request, res: Response) {
  try {
    const { cod_prom, cod_pub, cod_us } = req.body;

    // Validaciones
    if (!cod_prom || !cod_pub || !cod_us) {
      return res.status(400).json({
        success: false,
        message: 'cod_prom, cod_pub y cod_us son requeridos'
      });
    }

    // Parsear a números
    const data = {
      cod_prom: parseInt(cod_prom),
      cod_pub: parseInt(cod_pub),
      cod_us: parseInt(cod_us)
    };

    if (isNaN(data.cod_prom) || isNaN(data.cod_pub) || isNaN(data.cod_us)) {
      return res.status(400).json({
        success: false,
        message: 'Los códigos deben ser números válidos'
      });
    }

    const result = await PromotionService.unlinkPromotionFromPublication(data);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error en unlinkPromotion controller:', error);
    return res.status(400).json({
      success: false,
      message: (error as Error).message
    });
  }
}

/**
 * Obtener todas las promociones activas
 */
export async function getActivePromotions(req: Request, res: Response) {
  try {
    const promotions = await PromotionService.getActivePromotions();
    return res.status(200).json({
      success: true,
      data: promotions
    });
  } catch (error) {
    console.error('Error en getActivePromotions controller:', error);
    return res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
}

/**
 * Obtener publicaciones vinculadas a una promoción
 */
export async function getPublicationsByPromotion(req: Request, res: Response) {
  try {
    const { cod_prom } = req.params;
    const codPromNum = parseInt(cod_prom);

    if (isNaN(codPromNum)) {
      return res.status(400).json({
        success: false,
        message: 'Código de promoción inválido'
      });
    }

    const publications = await PromotionService.getPublicationsByPromotion(codPromNum);
    return res.status(200).json({
      success: true,
      data: publications
    });
  } catch (error) {
    console.error('Error en getPublicationsByPromotion controller:', error);
    return res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
}

/**
 * Obtener promociones de un usuario
 */
export async function getUserPromotions(req: Request, res: Response) {
  try {
    const { cod_us } = req.params;
    const codUsNum = parseInt(cod_us);

    if (isNaN(codUsNum)) {
      return res.status(400).json({
        success: false,
        message: 'Código de usuario inválido'
      });
    }

    const promotions = await PromotionService.getUserPromotions(codUsNum);
    return res.status(200).json({
      success: true,
      data: promotions
    });
  } catch (error) {
    console.error('Error en getUserPromotions controller:', error);
    return res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
}

/**
 * Obtener precio de una publicación (con descuento si aplica)
 */
export async function getPublicationPrice(req: Request, res: Response) {
  try {
    const { cod_pub } = req.params;
    const codPubNum = parseInt(cod_pub);

    if (isNaN(codPubNum)) {
      return res.status(400).json({
        success: false,
        message: 'Código de publicación inválido'
      });
    }

    const price = await PromotionService.getPublicationPrice(codPubNum);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }

    return res.status(200).json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error('Error en getPublicationPrice controller:', error);
    return res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
}

/**
 * Obtener banner de una promoción
 */
export async function getPromotionBanner(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const codPromNum = parseInt(id);

    if (isNaN(codPromNum)) {
      return res.status(400).json({
        success: false,
        message: 'Código de promoción inválido'
      });
    }

    const banner = await PromotionService.getPromotionBanner(codPromNum);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner no encontrado'
      });
    }

    // Enviar imagen
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(banner);

  } catch (error) {
    console.error('Error en getPromotionBanner controller:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
}