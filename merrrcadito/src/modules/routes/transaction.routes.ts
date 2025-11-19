import { Router } from 'express';
import * as TransactionController from '../controllers/transaction.controller';

const router = Router();

router.post('/register', TransactionController.registerTransaction);

export default router;