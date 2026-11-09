import { Response } from 'express';
import { patientService } from '../services/patient.service';
import { RegisterPatientSchema } from '../validators';
import { AuthRequest } from '../types';

export class PatientController {
  async register(req: AuthRequest, res: Response) {
    try {
      const validatedData = RegisterPatientSchema.parse(req.body);
      const patient = await patientService.registerPatient(validatedData, req.user!);
      res.status(201).json({ success: true, data: patient });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async search(req: AuthRequest, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      const patients = await patientService.searchPatients(query);
      res.status(200).json({ success: true, data: patients });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const result = await patientService.getPatientProfile(patientId, req.user!);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getTimeline(req: AuthRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const timeline = await patientService.getPatientTimeline(patientId, req.user!);
      res.status(200).json({ success: true, data: timeline });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const patientController = new PatientController();
