import { Router } from 'express';
import * as CategoryController from '../controllers/category.controller';

const router = Router();

// TODO: Conectar los store procedures
router.post('/register', CategoryController.registerCategory);

router.put('/update', CategoryController.updateCategory);

router.get('/get_all', CategoryController.getAllSubcategories);

export default router;
