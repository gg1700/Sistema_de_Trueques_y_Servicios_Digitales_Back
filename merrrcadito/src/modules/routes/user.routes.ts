import { Router } from 'express';
import * as UserController from '../controllers/user.controller';

const router = Router();

router.get('/activity_report_by_week', UserController.getUsersActivityReportByWeek);

router.get('/activity_report_by_month', UserController.getUsersActivityReportByMonth);

export default router;