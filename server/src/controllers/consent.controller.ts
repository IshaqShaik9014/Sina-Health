import { Response } from 'express';
import { consentService } from '../services/consent.service';
import { CreateAccessRequestSchema, PatientConsentDecisionSchema, FacilityApprovalDecisionSchema } from '../validators';
import { AuthRequest } from '../types';

export class ConsentController {
  async createRequest(req: AuthRequest, res: Response) {
    try {
      const data = CreateAccessRequestSchema.parse(req.body);
      const request = await consentService.createAccessRequest(data, {
        id: req.user!.id,
        role: req.user!.role,
        organizationId: req.user!.organizationId!,
      });

      res.status(201).json({ success: true, data: request });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getPatientRequests(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const requests = await consentService.getPatientRequests(patientId);
      res.status(200).json({ success: true, data: requests });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getFacilityRequests(req: AuthRequest, res: Response) {
    try {
      const facilityId = req.user!.organizationId!;
      const requests = await consentService.getFacilityRequests(facilityId);
      res.status(200).json({ success: true, data: requests });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async patientDecision(req: AuthRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const { decision, allowedCategories } = PatientConsentDecisionSchema.parse(req.body);

      const result = await consentService.processPatientDecision(
        requestId,
        decision,
        allowedCategories,
        {
          id: req.user!.id,
          role: req.user!.role,
          patientId: (req.user as any).patientId,
        }
      );

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async facilityDecision(req: AuthRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const { decision } = FacilityApprovalDecisionSchema.parse(req.body);

      const result = await consentService.processFacilityDecision(requestId, decision, {
        id: req.user!.id,
        role: req.user!.role,
        organizationId: req.user!.organizationId!,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async revokeGrant(req: AuthRequest, res: Response) {
    try {
      const { grantId } = req.params;
      const result = await consentService.revokeAccessGrant(grantId, {
        id: req.user!.id,
        role: req.user!.role,
        patientId: (req.user as any).patientId,
        organizationId: req.user!.organizationId,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const consentController = new ConsentController();
