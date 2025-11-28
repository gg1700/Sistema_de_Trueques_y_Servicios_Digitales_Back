import { Router } from 'express';
import multer from 'multer';
import * as ExchangeController from '../controllers/exchange.controller';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

// Crear un nuevo intercambio
router.post('/create', upload.single('foto_inter'), ExchangeController.createExchange);

// Obtener intercambios de un usuario (Historial)
router.get('/get_user_exchange_history', ExchangeController.getUserExchangeHistory);

// ⚠️ IMPORTANTE: Rutas específicas ANTES de rutas con parámetros
// Obtener todos los intercambios abiertos
router.get('/open', ExchangeController.getAllOpenExchanges);

// Obtener solicitudes de intercambio pendientes (para usuario destino)
router.get('/pending', ExchangeController.getPendingExchangeRequests);

// Obtener intercambios de un usuario
router.get('/user/:cod_us', ExchangeController.getUserExchanges);
router.get('/user/:userId', ExchangeController.getUserExchanges);

// Obtener intercambios por estado
router.get('/user/:userId/status/:status', ExchangeController.getExchangesByStatus);

// Obtener imagen de un intercambio
router.get('/:cod_inter/image', ExchangeController.getExchangeImage);
router.get('/:exchangeId/image', ExchangeController.getExchangeImage);

// Proponer un producto para un intercambio
router.post('/:cod_inter/propose', upload.single('foto_prod'), ExchangeController.proposeExchange);

// Aceptar una propuesta de intercambio
router.post('/:cod_inter/accept', ExchangeController.acceptExchangeProposal);
router.put('/:exchangeId/accept', ExchangeController.acceptExchange);

// Rechazar una propuesta de intercambio
router.post('/:cod_inter/reject', ExchangeController.rejectExchangeProposal);
router.put('/:exchangeId/reject', ExchangeController.rejectExchange);

// Confirmar intercambio físico
router.put('/:exchangeId/confirm', ExchangeController.confirmExchange);

// Obtener detalles de un intercambio específico
router.get('/:exchangeId', ExchangeController.getExchangeDetails);

export default router;
