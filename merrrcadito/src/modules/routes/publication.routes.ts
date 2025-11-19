import { Router } from "express";
import * as PublicationController from '../controllers/publication.controller';

const router = Router();

router.get('/:id/image', PublicationController.getPublicacionPhoto);

export default router;