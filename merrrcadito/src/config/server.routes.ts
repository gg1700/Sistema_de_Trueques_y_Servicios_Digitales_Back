import { Router } from 'express';
import PromocionesRoutes from '../modules/Promociones.routes';
import CategoryRoutes from '../modules/routes/category.routes';

const router = Router();

router.use('/api/promociones', PromocionesRoutes);
router.use('/api/category', CategoryRoutes);

router.use((req, res) => {
  console.log('Not found:', req.method, req.originalUrl);
  res.status(400).send({
    message: 'Route not found.',
  });
});

export default router;
