import { Router } from "express";
import * as PublicationController from '../controllers/publication.controller';

const router = Router();

// Obtener foto de publicación
router.get('/:id/image', PublicationController.getPublicacionPhoto);

// Obtener publicaciones de un usuario
router.get('/user/:cod_us', PublicationController.getUserPublications);

export default router;