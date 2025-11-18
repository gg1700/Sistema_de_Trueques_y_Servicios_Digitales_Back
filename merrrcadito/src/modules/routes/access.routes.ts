import { Router } from 'express';
import * as AccessController from '../controllers/access.controller';

const router = Router();

router.post('/register', AccessController.registerAccess);

router.post('/register_logout', AccessController.registerLogout);

export default router;