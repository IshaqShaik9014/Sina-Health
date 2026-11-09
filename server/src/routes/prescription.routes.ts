import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Doctor prescribing
router.post('/', requireRole(Role.DOCTOR), (req, res) => prescriptionController.create(req, res));
router.get('/:prescriptionId', (req, res) => prescriptionController.getById(req, res));
router.get('/patient/:patientId', (req, res) => prescriptionController.getPatientPrescriptions(req, res));

// Pharmacist dispensing
router.post('/:prescriptionId/dispense', requireRole(Role.PHARMACIST), (req, res) => prescriptionController.dispense(req, res));

export default router;
