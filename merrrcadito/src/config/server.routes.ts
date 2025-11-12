import { Router } from 'express';
import PromocionesRoutes from '../modules/Promociones.routes';
import CategoryRoutes from '../modules/routes/category.routes';
import HealthCheck from '../modules/routes/healthcheck.routes';
import SubcategoryRoutes from '../modules/routes/subcategory.routes';
import EquivalenceRoutes from '../modules/routes/equivalence.routes';

const router = Router();

router.use('/api/promociones', PromocionesRoutes);
router.use('/api/category', CategoryRoutes);
router.use('/api/subcategory', SubcategoryRoutes);
router.use('/api/equivalence', EquivalenceRoutes);
router.use('/', HealthCheck);

router.use((req, res) => {
  console.log('Not found:', req.method, req.originalUrl);
  res.status(400).send({
    message: 'Route not found.',
  });
});

export default router;
