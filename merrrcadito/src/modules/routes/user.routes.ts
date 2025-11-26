import { Router } from 'express';
import multer from 'multer';
import * as UserController from '../controllers/user.controller';
import * as EntrepreneurController from '../controllers/entrepreneur.controller';
import { getAllUsers, getUserProducts } from '../controllers/user_exchange_helpers';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

// New routes for exchange form - MUST be before /:id/image
router.get('/all', getAllUsers);
router.get('/:userId/products', getUserProducts);

router.get('/activity_report_by_week', UserController.getUsersActivityReportByWeek);

router.get('/activity_report_by_month', UserController.getUsersActivityReportByMonth);

router.post('/register', upload.single('foto_us'), UserController.registerUser);

router.post('/register_entrepreneur', upload.single('foto_us'), EntrepreneurController.registerEntrepreneur);

router.get('/get_user_data', UserController.getUserData);

router.get('/get_user_posts', UserController.getUserPosts);

router.get('/get_rankin_users_co2', UserController.getRankingUsersByCO2);

router.get('/:id/image', UserController.getUserImage);

router.get('/get_rankin_users_sells', UserController.getRankingUsersBySells);

router.put('/update_co2_impact', UserController.updateCo2Impact);

router.get('/action_report_by_month', UserController.getUsersActionsByMonth);

export default router;