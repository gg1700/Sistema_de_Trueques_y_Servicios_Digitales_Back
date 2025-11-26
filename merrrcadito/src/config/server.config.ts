import express from 'express';
import cors from 'cors';
import AppRoutes from './server.routes';
import TransactionRoutes from '../modules/routes/transaction.routes';
import ExchangeRoutes from '../modules/routes/exchange.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use(AppRoutes);
app.use(TransactionRoutes);

export default app;