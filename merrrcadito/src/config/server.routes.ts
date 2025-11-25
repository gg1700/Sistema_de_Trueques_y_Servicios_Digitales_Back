import { Router } from 'express';
import PromotionRoutes from '../modules/routes/promotion.routes';
import CategoryRoutes from '../modules/routes/category.routes';
import HealthCheck from '../modules/routes/healthcheck.routes';
import SubcategoryRoutes from '../modules/routes/subcategory.routes';
import EquivalenceRoutes from '../modules/routes/equivalence.routes';
import ProductRoutes from '../modules/routes/product.routes';
import PostRoutes from '../modules/routes/post.routes';
import UserRoutes from '../modules/routes/user.routes';
import OrganizationRoutes from '../modules/routes/organization.routes';
import AccessRoutes from '../modules/routes/access.routes';
import WalletRoutes from '../modules/routes/wallet.routes';
import TransactionRoutes from '../modules/routes/transaction.routes';
import ExchangeRoutes from '../modules/routes/exchange.routes';
import TokenPackageRoutes from '../modules/routes/token_package.routes';
import AchievementRoutes from '../modules/routes/achievment.routes';
import PublicationRoutes from '../modules/routes/publication.routes';
import EventRoutes from '../modules/routes/event.routes';
import ReportsRoutes from '../modules/routes/reports.routes';


const router = Router();

router.use('/api/promotions', PromotionRoutes);
router.use('/api/categories', CategoryRoutes);
router.use('/api/subcategories', SubcategoryRoutes);
router.use('/api/equivalences', EquivalenceRoutes);
router.use('/api/products', ProductRoutes);
router.use('/api/posts', PostRoutes);
router.use('/api/users', UserRoutes);
router.use('/api/access', AccessRoutes);
router.use('/api/wallets', WalletRoutes);
router.use('/api/transactions', TransactionRoutes);
router.use('/api/exchanges', ExchangeRoutes);
router.use('/api/organization', OrganizationRoutes);
router.use('/api/token_package', TokenPackageRoutes);
router.use('/api/achievments', AchievementRoutes);
router.use('/api/publications', PublicationRoutes);
router.use('/api/events', EventRoutes);
router.use('/api/reports', ReportsRoutes);

router.use('/', HealthCheck);

router.use((req, res) => {
  console.log('Not found:', req.method, req.originalUrl);
  res.status(404).send({
    success: false,
    message: 'Route not found.',
  });
});

export default router;