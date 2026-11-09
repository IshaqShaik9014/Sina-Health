import { Router } from 'express';
import { consentController } from '../controllers/consent.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Request cross-hospital access (Clinicians)
router.post('/requests', requireRole(Role.DOCTOR), (req, res) => consentController.createRequest(req, res));

// View requests for a patient
router.get('/patient/:patientId', (req, res) => consentController.getPatientRequests(req, res));

// View requests for facility administrators
router.get('/facility', requireRole(Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN), (req, res) => consentController.getFacilityRequests(req, res));

// Patient Decision (Approve / Reject)
router.post('/requests/:requestId/patient-decision', requireRole(Role.PATIENT, Role.SUPER_ADMIN), (req, res) => consentController.patientDecision(req, res));

// Facility Decision (Verify / Approve transfer)
router.post('/requests/:requestId/facility-decision', requireRole(Role.HOSPITAL_ADMIN, Role.SUPER_ADMIN), (req, res) => consentController.facilityDecision(req, res));

// Revoke active access grant
router.post('/grants/:grantId/revoke', (req, res) => consentController.revokeGrant(req, res));

export default router;
