import { Router } from 'express';
import { pharmacyController } from '../controllers/pharmacy.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.PHARMACIST, Role.SUPER_ADMIN));

// Pharmacist scoped patient lookup (Strictly 2 eligible prescriptions)
router.get('/lookup/:patientId', (req, res) => pharmacyController.lookupPatientPrescriptions(req, res));

// Pharmacovigilance & Adverse Drug Reaction reporting
router.post('/adr', (req, res) => pharmacyController.reportADR(req, res));

// Recent dispensary activity
router.get('/activity', (req, res) => pharmacyController.getRecentDispensings(req, res));

export default router;
