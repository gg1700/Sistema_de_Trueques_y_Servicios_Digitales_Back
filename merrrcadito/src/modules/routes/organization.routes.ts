import { Router } from 'express';
import * as OrganizationController from '../controllers/organization.controller';

const router = Router();

router.post('/register', OrganizationController.registerOrganization);

router.get('/get_organization_data', OrganizationController.getOrganizationData);

export default router;