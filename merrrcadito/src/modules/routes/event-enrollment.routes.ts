import { Router } from "express";
import * as eventEnrollmentController from "../controllers/event-enrollment.controller";

const router = Router();

// Obtener eventos inscritos de un usuario
router.get("/user/:userId", eventEnrollmentController.getUserEnrolledEvents);

// Inscribir usuario en evento
router.post("/enroll", eventEnrollmentController.enrollUserInEvent);

// Desinscribir usuario de evento
router.delete("/unenroll", eventEnrollmentController.unenrollUserFromEvent);

// Verificar si usuario está inscrito en evento
router.get("/check/:userId/:eventId", eventEnrollmentController.checkUserEnrollment);

export default router;
