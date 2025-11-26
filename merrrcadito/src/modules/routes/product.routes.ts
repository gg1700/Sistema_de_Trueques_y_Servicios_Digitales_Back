import { Router } from 'express';
import * as ProductController from '../controllers/product.controller';
import { getUserProducts } from '../controllers/user_exchange_helpers';

const router = Router();

router.post('/register', ProductController.registerProduct);
router.get('/user/:userId', getUserProducts);

export default router;