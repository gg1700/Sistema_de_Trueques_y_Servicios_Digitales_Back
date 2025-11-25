import { Router } from 'express';
import * as TransactionController from '../controllers/transaction.controller';
import * as PurchaseController from '../controllers/purchase.controller';

const router = Router();

router.post('/register', TransactionController.registerTransaction);

router.post('/purchase_product', PurchaseController.purchaseProduct);

router.get('/get_user_transaction_history', TransactionController.getUserTransactionHistory);

router.get('/get_complete_transactions_month', TransactionController.getCompleteTransactionHistoryByMonth);

export default router;