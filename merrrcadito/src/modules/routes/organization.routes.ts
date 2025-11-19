import { Router } from "express";
import * as OrganizationController from '../../modules/controllers/organization.controller';

const router = Router();

router.get('/:id/image', OrganizationController.getOrganizationLogo);

export default router;