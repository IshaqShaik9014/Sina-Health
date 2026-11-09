import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Registration & Search
router.post('/', requireRole(Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN, Role.DOCTOR), (req, res) => patientController.register(req, res));
router.get('/', (req, res) => patientController.search(req, res));

// Patient Profile & Longitudinal Timeline
router.get('/:patientId', (req, res) => patientController.getProfile(req, res));
router.get('/:patientId/timeline', (req, res) => patientController.getTimeline(req, res));

export default router;
