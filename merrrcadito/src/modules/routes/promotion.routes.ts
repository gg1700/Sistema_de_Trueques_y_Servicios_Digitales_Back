import { Router } from 'express';
import { upload, handleMulterError } from '../../config/multer.config';
import * as PromotionController from '../controllers/promotion.controller';

const router = Router();

// Crear nueva promoción (con imagen)
router.post(
    '/create',
    upload.single('banner_prom'),
    handleMulterError,
    PromotionController.createPromotion
);

// Vincular promoción a publicación
router.post('/link', PromotionController.linkPromotion);

// Desvincular promoción de publicación
router.delete('/unlink', PromotionController.unlinkPromotion);

// Obtener todas las promociones activas
router.get('/active', PromotionController.getActivePromotions);

// Obtener publicaciones de una promoción específica
router.get('/:cod_prom/publications', PromotionController.getPublicationsByPromotion);

// Obtener promociones de un usuario
router.get('/user/:cod_us', PromotionController.getUserPromotions);

// Obtener precio de una publicación (con descuento si aplica)
router.get('/publication/:cod_pub/price', PromotionController.getPublicationPrice);

// Obtener banner de una promoción
router.get('/:id/image', PromotionController.getPromotionBanner);

export default router;