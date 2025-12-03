import * as AchievementController from '../controllers/achievement.controller';
import { Router } from 'express';

const router = Router();

router.get('/:id/image', AchievementController.getAchievementLogo);
router.get('/user/:id', AchievementController.getUserAchievements);

export default router;