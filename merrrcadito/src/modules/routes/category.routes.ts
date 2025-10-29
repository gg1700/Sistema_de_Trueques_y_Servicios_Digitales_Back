import { Router } from 'express';
import * as CategoryController from '../controllers/category.controller';

const router = Router();

// TODO: Conectar los store procedures
router.post('/register', CategoryController.registerCategory);

export default router;
