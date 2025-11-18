import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';

const router = Router();

router.post('/create', walletController.createWallet);

export default router;