import { Router } from 'express';
import multer from 'multer';
import * as exchangeController from '../controllers/exchange.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Crear nuevo intercambio (propuesta)
router.post('/create', upload.single('foto_inter'), exchangeController.createExchange);

// Aceptar propuesta de intercambio
router.put('/:exchangeId/accept', exchangeController.acceptExchange);

// Rechazar propuesta de intercambio
router.put('/:exchangeId/reject', exchangeController.rejectExchange);

// Confirmar intercambio físico
router.put('/:exchangeId/confirm', exchangeController.confirmExchange);

// Obtener intercambios por estado
router.get('/user/:userId/status/:status', exchangeController.getExchangesByStatus);

// Obtener intercambios de un usuario
router.get('/user/:userId', exchangeController.getUserExchanges);

// Obtener imagen de un intercambio
router.get('/:exchangeId/image', exchangeController.getExchangeImage);

// Obtener detalles de un intercambio específico
router.get('/:exchangeId', exchangeController.getExchangeDetails);

export default router;
