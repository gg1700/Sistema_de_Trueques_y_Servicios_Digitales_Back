import { Router } from 'express';
import * as WalletController from '../controllers/wallet.controller';

const router = Router();

router.post('/create', WalletController.createWallet);

router.get('/get_wallet_data_by_user', WalletController.getWalletDataByUser);

export default router;