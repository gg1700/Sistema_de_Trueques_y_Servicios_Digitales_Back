import {Router} from 'express'
import * as SubcategoryController from '../controllers/subcategory.controller';

const router=Router();

router.post('/register', SubcategoryController.registerSubcategory);
router.get('/get', SubcategoryController.getSubcategory);

router.put('/update', SubcategoryController.updateSubcategory);

export default router;
