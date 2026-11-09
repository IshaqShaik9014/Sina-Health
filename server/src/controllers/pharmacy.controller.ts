import { Response } from 'express';
import { prescriptionService } from '../services/prescription.service';
import { AuthRequest } from '../types';
import prisma from '../config/prisma';
import { logAuditEvent } from '../middleware/auditLogger';

export class PharmacyController {
  async lookupPatientPrescriptions(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const result = await prescriptionService.getPrescriptionsForPharmacist(patientId, {
        id: req.user!.id,
        role: req.user!.role,
        organizationId: req.user!.organizationId!,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async reportADR(req: AuthRequest, res: Response) {
    try {
      const { patientId, medicationName, severity, symptoms, onsetDate } = req.body;

      const adr = await prisma.adverseDrugReaction.create({
        data: {
          patientId,
          reporterId: req.user!.id,
          pharmacyId: req.user!.organizationId,
          medicationName,
          severity,
          symptoms,
          onsetDate: new Date(onsetDate),
        },
      });

      await logAuditEvent({
        userId: req.user!.id,
        userRole: req.user!.role,
        organizationId: req.user!.organizationId!,
        patientId,
        action: 'REPORT_ADVERSE_DRUG_REACTION',
        recordCategory: 'PHARMACOVIGILANCE',
        purpose: `ADR Report for ${medicationName} (${severity})`,
      });

      res.status(201).json({ success: true, data: adr });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getRecentDispensings(req: AuthRequest, res: Response) {
    try {
      const pharmacyId = req.user!.organizationId;
      const dispensings = await prisma.dispensingRecord.findMany({
        where: pharmacyId ? { pharmacyId } : undefined,
        include: {
          patient: { select: { sinaId: true, firstName: true, lastName: true } },
          prescription: {
            include: {
              items: true,
              doctor: { select: { firstName: true, lastName: true } },
            },
          },
          pharmacist: { select: { firstName: true, lastName: true } },
        },
        orderBy: { dispensedAt: 'desc' },
        take: 30,
      });

      res.status(200).json({ success: true, data: dispensings });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const pharmacyController = new PharmacyController();
