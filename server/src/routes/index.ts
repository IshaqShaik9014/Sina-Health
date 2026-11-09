import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import encounterRoutes from './encounter.routes';
import prescriptionRoutes from './prescription.routes';
import pharmacyRoutes from './pharmacy.routes';
import consentRoutes from './consent.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/encounters', encounterRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/consent', consentRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'SINA - Smart Integrated Network for Healthcare Access',
    timestamp: new Date().toISOString(),
  });
});

export default router;
