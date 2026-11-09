import { Router } from 'express';
import { encounterController } from '../controllers/encounter.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', requireRole(Role.DOCTOR), (req, res) => encounterController.create(req, res));
router.get('/:encounterId', (req, res) => encounterController.getById(req, res));

export default router;
