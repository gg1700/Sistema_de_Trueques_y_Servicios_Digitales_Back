import { Router } from 'express';
import * as UserController from '../controllers/user.controller';

const router = Router();

router.get('/activity_report_by_week', UserController.getUsersActivityReportByWeek);

router.get('/activity_report_by_month', UserController.getUsersActivityReportByMonth);

router.post('/register', UserController.registerUser);

router.get('/get_user_data', UserController.getUserData);

router.get('/get_user_posts', UserController.getUserPosts);

export default router;