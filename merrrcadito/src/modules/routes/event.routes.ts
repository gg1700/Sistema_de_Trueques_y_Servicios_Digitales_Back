import { Router } from 'express';
import * as EventController from '../controllers/event.controller';

import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.get('/get_events_user', EventController.getEventsByUser);
router.get('/get_events_org', EventController.getEventsByOrg);
router.post('/create', upload.single('banner_evento'), EventController.createEvent);

export default router;