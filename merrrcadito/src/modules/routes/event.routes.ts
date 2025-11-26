import { Router } from 'express';
import * as EventController from '../controllers/event.controller';

const router = Router();

router.get('/rewards', EventController.getAllRewards);
router.get('/get_events_user', EventController.getEventsByUser);
router.get('/get_user_created_events', EventController.getUserCreatedEvents);
router.post('/create', EventController.uploadEventBanner, EventController.createEvent);
router.get('/:cod_evento/image', EventController.getEventImage);

export default router;