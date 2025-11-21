import { Router } from 'express';
import * as EventController from '../controllers/event.controller';

const router = Router();

router.get('/get_events_user', EventController.getEventsByUser);

export default router;