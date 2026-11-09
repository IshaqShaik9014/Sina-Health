import { Response } from 'express';
import { encounterRepository } from '../repositories/encounter.repository';
import { CreateEncounterSchema } from '../validators';
import { AuthRequest } from '../types';
import { logAuditEvent } from '../middleware/auditLogger';

export class EncounterController {
  async create(req: AuthRequest, res: Response) {
    try {
      const data = CreateEncounterSchema.parse(req.body);
      const encounter = await encounterRepository.create({
        ...data,
        doctorId: req.user!.id,
        organizationId: req.user!.organizationId!,
      });

      await logAuditEvent({
        userId: req.user!.id,
        userRole: req.user!.role,
        organizationId: req.user!.organizationId!,
        patientId: data.patientId,
        action: 'CREATE_CLINICAL_ENCOUNTER',
        recordCategory: 'CLINICAL_ENCOUNTER',
        purpose: 'Documentation of patient examination & treatment',
      });

      res.status(201).json({ success: true, data: encounter });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { encounterId } = req.params;
      const encounter = await encounterRepository.findById(encounterId);
      if (!encounter) {
        res.status(404).json({ success: false, error: 'Encounter not found' });
        return;
      }
      res.status(200).json({ success: true, data: encounter });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const encounterController = new EncounterController();
