import healthcheck from "../controllers/healthcheck.controller";
import { Router } from "express";

const router = Router();

router.get('/health', healthcheck);

export default router;