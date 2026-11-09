import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.SUPER_ADMIN, Role.HOSPITAL_ADMIN));

router.get('/organizations', (req, res) => adminController.getOrganizations(req, res));
router.patch('/organizations/:orgId/status', requireRole(Role.SUPER_ADMIN), (req, res) => adminController.updateOrganizationStatus(req, res));
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.get('/audit-logs', (req, res) => adminController.getAuditLogs(req, res));
router.get('/analytics', (req, res) => adminController.getAnalytics(req, res));

export default router;
