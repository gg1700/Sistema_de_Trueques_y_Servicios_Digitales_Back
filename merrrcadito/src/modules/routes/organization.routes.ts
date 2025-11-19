import { Router } from "express";
import multer from 'multer';
import * as OrganizationController from '../../modules/controllers/organization.controller';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', upload.single('logo_org'), OrganizationController.registerOrganization);

router.get('/:id/image', OrganizationController.getOrganizationLogo);

export default router;