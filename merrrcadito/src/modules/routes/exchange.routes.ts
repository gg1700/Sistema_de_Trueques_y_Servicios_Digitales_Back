import { Router } from 'express';
import multer from 'multer';
import * as ExchangeController from '../controllers/exchange.controller';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

// Crear un nuevo intercambio
router.post('/create', upload.single('foto_inter'), ExchangeController.createExchange);

// Obtener intercambios de un usuario
router.get('/user/:cod_us', ExchangeController.getUserExchanges);

// Obtener imagen de un intercambio
router.get('/:cod_inter/image', ExchangeController.getExchangeImage);

export default router;
