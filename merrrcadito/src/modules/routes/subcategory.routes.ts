import {Router} from 'express'
import * as SubcategoryController from '../controllers/subcategory.controller';

const router=Router();

//Conectar con los storage procedures
router.post('/register', SubcategoryController.registerSubcategory);

export default router;
