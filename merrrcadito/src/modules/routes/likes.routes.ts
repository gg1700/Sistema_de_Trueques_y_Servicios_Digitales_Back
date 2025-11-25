import { Router } from "express";
import * as likesController from "../controllers/likes.controller";

const router = Router();

// Agregar un me gusta
router.post("/add", likesController.addLike);

// Eliminar un me gusta
router.delete("/remove", likesController.removeLike);

// Obtener todos los likes de un usuario
router.get("/user/:userId", likesController.getUserLikes);

// Verificar si un usuario le dio like a una publicación
router.get("/check/:userId/:publicationId", likesController.checkUserLike);

// Obtener el conteo de likes de una publicación
router.get("/count/:publicationId", likesController.getPublicationLikesCount);

export default router;
