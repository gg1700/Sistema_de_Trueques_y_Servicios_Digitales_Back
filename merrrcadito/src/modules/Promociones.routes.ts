import { Router } from 'express';
import {
    registrarPromocion
} from './Promociones.controller';

const router = Router();

router.post('/registrar', registrarPromocion);

export default router;