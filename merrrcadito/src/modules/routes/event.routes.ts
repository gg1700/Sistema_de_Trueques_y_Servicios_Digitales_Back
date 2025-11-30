import { Router } from 'express';
import * as EventController from '../controllers/event.controller';

import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.get('/all', EventController.getAllEvents);
router.get('/rewards', EventController.getAllRewards);
router.get('/get_events_user', EventController.getEventsByUser);
router.get('/get_user_created_events', EventController.getUserCreatedEvents);
router.get('/get_events_org', EventController.getEventsByOrg);
router.post('/create', upload.single('banner_evento'), EventController.createEvent);
router.get('/default-image', EventController.getDefaultImage);
router.get('/:cod_evento/image', EventController.getEventImage);
router.get('/:cod_evento', EventController.getEventById);


export default router;