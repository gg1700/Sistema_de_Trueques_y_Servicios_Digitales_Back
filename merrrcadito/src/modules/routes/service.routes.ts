import { Router } from "express";
import * as serviceController from "../controllers/service.controller";
import { upload, handleMulterError } from "../../config/multer.config";

const router = Router();

// Crear nuevo servicio
router.post("/create", upload.single('foto_serv'), handleMulterError, serviceController.createService);

// Obtener servicios de un usuario
router.get("/user/:userId", serviceController.getUserServices);

export default router;
