import { Router } from 'express';
import * as ProductController from '../controllers/product.controller';

const router = Router();

router.post('/register', ProductController.registerProduct);

export default router;