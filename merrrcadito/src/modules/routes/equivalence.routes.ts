import {  Router } from "express";
import * as EquivalenceController from '../controllers/equivalence.controller';

const router = Router();

router.post('/register', EquivalenceController.registerEquivalence);

export default router;