import {Router} from 'express'
import * as SubcategoryController from '../controllers/subcategory.controller';

const router=Router();

router.post('/register', SubcategoryController.registerSubcategory);
router.get('/get', SubcategoryController.getSubcategory);

export default router;
