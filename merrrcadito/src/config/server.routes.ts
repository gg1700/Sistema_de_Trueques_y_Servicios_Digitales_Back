import { Router } from 'express';
import PromocionesRoutes from '../modules/Promociones.routes';
import CategoryRoutes from '../modules/routes/category.routes';
import HealthCheck from '../modules/routes/healthcheck.routes';
import SubcategoryRoutes from '../modules/routes/subcategory.routes';
import EquivalenceRoutes from '../modules/routes/equivalence.routes';
import ProductRoutes from '../modules/routes/product.routes';
import PostRoutes from '../modules/routes/post.routes';
import UserRoutes from '../modules/routes/user.routes';
import OrganizationRoutes from '../modules/routes/organization.routes';

const router = Router();

router.use('/api/promociones', PromocionesRoutes);
router.use('/api/categories', CategoryRoutes);
router.use('/api/subcategories', SubcategoryRoutes);
router.use('/api/equivalences', EquivalenceRoutes);
router.use('/api/products', ProductRoutes);
router.use('/api/posts', PostRoutes);
router.use('/api/users', UserRoutes);
router.use('/api/organizations', OrganizationRoutes);

router.use('/', HealthCheck);


router.use((req, res) => {
  console.log('Not found:', req.method, req.originalUrl);
  res.status(404).send({
    success: false,
    message: 'Route not found.',
  });
});

export default router;