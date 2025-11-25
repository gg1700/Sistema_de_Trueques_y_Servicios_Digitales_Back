import { Router } from 'express';
import * as ExchangeController from '../controllers/exchange.controller';

const router = Router();

router.get('/get_user_exchange_history', ExchangeController.getUserExchangeHistory);

export default router;
