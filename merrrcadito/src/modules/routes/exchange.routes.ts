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

// Obtener intercambios de un usuario
router.get('/user/:cod_us', ExchangeController.getUserExchanges);

// Obtener imagen de un intercambio
router.get('/:cod_inter/image', ExchangeController.getExchangeImage);

// Proponer un producto para un intercambio
router.post('/:cod_inter/propose', upload.single('foto_prod'), ExchangeController.proposeExchange);

export default router;
