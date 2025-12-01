import express from 'express';
import cors from 'cors';
import AppRoutes from './server.routes';
import TransactionRoutes from '../modules/routes/transaction.routes';
import ExchangeRoutes from '../modules/routes/exchange.routes';

import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// Serve static images
app.use('/api/images', express.static(path.join(__dirname, '../images')));

app.use(AppRoutes);
app.use(TransactionRoutes);

export default app;