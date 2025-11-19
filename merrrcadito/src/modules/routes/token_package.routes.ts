import { Router } from 'express';
import * as TokenPackageController from '../controllers/token_package.controller';

const router = Router();

router.post('/register', TokenPackageController.registerTokenPackage);

router.get('/get_all', TokenPackageController.getAllPackages);

export default router;