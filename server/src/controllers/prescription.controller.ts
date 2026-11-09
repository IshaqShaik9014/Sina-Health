import { Response } from 'express';
import { prescriptionService } from '../services/prescription.service';
import { prescriptionRepository } from '../repositories/prescription.repository';
import { CreatePrescriptionSchema, DispenseMedicationSchema } from '../validators';
import { AuthRequest } from '../types';

export class PrescriptionController {
  async create(req: AuthRequest, res: Response) {
    try {
      const data = CreatePrescriptionSchema.parse(req.body);
      const result = await prescriptionService.createPrescription(data, {
        id: req.user!.id,
        role: req.user!.role,
        organizationId: req.user!.organizationId!,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { prescriptionId } = req.params;
      const prescription = await prescriptionRepository.findById(prescriptionId);
      if (!prescription) {
        res.status(404).json({ success: false, error: 'Prescription not found' });
        return;
      }
      res.status(200).json({ success: true, data: prescription });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getPatientPrescriptions(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const prescriptions = await prescriptionRepository.findByPatientId(patientId);
      res.status(200).json({ success: true, data: prescriptions });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async dispense(req: AuthRequest, res: Response) {
    try {
      const data = DispenseMedicationSchema.parse(req.body);
      const result = await prescriptionService.dispenseMedication(data, {
        id: req.user!.id,
        role: req.user!.role,
        organizationId: req.user!.organizationId!,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const prescriptionController = new PrescriptionController();
