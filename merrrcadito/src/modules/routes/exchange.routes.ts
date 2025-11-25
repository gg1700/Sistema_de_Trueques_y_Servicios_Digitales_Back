import { Router } from 'express';
import multer from 'multer';
import * as exchangeController from '../controllers/exchange.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Crear nuevo intercambio
router.post('/create', upload.single('foto_inter'), exchangeController.createExchange);

// Obtener intercambios de un usuario
router.get('/user/:userId', exchangeController.getUserExchanges);

// Obtener imagen de un intercambio
router.get('/:exchangeId/image', exchangeController.getExchangeImage);

// Obtener detalles de un intercambio específico
router.get('/:exchangeId', exchangeController.getExchangeDetails);

export default router;
