import { Router } from 'express';
import multer from 'multer';
import * as TokenPackageController from '../controllers/token_package.controller';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', upload.single('image'), TokenPackageController.registerTokenPackage);

router.get('/get_all', TokenPackageController.getAllPackages);

router.get('/:id/image', TokenPackageController.getPackageImage);

export default router;