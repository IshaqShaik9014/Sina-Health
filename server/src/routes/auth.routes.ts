import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.post('/register/patient', (req, res) => authController.registerPatient(req, res));
router.post('/register/staff', (req, res) => authController.registerStaff(req, res));
router.get('/facilities', (req, res) => authController.getFacilities(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', authenticate, (req, res) => authController.getCurrentUser(req, res));

export default router;
