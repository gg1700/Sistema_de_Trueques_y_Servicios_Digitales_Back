import { Router } from 'express';
import * as TransactionController from '../controllers/transaction.controller';

const router = Router();

router.post('/register', TransactionController.registerTransaction);

router.get('/get_user_transaction_history', TransactionController.getUserTransactionHistory);

router.get('/get_complete_transactions_month', TransactionController.getCompleteTransactionHistoryByMonth);

export default router;