import { Router } from "express";
import * as serviceController from "../controllers/service.controller";

const router = Router();

// Crear nuevo servicio
router.post("/create", serviceController.createService);

// Obtener servicios de un usuario
router.get("/user/:userId", serviceController.getUserServices);

export default router;
