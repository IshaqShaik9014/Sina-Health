import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', authenticate, (req, res) => authController.getCurrentUser(req, res));

export default router;
