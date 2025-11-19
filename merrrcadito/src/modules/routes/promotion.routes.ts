import { Router } from 'express';
import * as PromotionController from '../controllers/promotion.controller';

const router = Router();

router.post('/registrar', PromotionController.registrarPromocion);
router.get('/:id/image', PromotionController.getPromotionBanner);

export default router;