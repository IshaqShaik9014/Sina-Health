import { prescriptionRepository } from '../repositories/prescription.repository';
import { patientRepository } from '../repositories/patient.repository';
import { checkDrugInteractions, checkPatientAllergies } from '../utils/drugSafetyData';
import { logAuditEvent } from '../middleware/auditLogger';
import { Role } from '@prisma/client';

export class PrescriptionService {
  async createPrescription(data: any, doctor: { id: string; role: Role; organizationId: string }) {
    const patient = await patientRepository.findById(data.patientId);
    if (!patient) {
      throw new Error('Patient not found.');
    }

    // Safety Check: Allergies
    const patientAllergies = (patient.allergies || []).map((a: any) => a.allergen);
    const medNames = data.items.map((i: any) => i.medicationName);
    const allergyWarnings = checkPatientAllergies(patientAllergies, medNames);

    // Safety Check: Drug-drug interactions
    const interactionAlerts = checkDrugInteractions(medNames);

    // Create prescription in repository
    const prescription = await prescriptionRepository.create({
      patientId: data.patientId,
      doctorId: doctor.id,
      organizationId: doctor.organizationId,
      encounterId: data.encounterId,
      notes: data.notes,
      items: data.items,
    });

    await logAuditEvent({
      userId: doctor.id,
      userRole: doctor.role,
      organizationId: doctor.organizationId,
      patientId: patient.id,
      action: 'CREATE_PRESCRIPTION',
      recordCategory: 'PRESCRIPTIONS',
      purpose: 'Prescribing Therapy',
    });

    return {
      prescription,
      safetyReport: {
        hasAlerts: allergyWarnings.length > 0 || interactionAlerts.length > 0,
        allergyWarnings,
        interactionAlerts,
      },
    };
  }

  // Strict Pharmacist Lookup: Exactly last 2 eligible prescriptions & permitted medication information only
  async getPrescriptionsForPharmacist(patientLookup: string, pharmacist: { id: string; role: Role; organizationId: string }) {
    let patient = await patientRepository.findBySinaId(patientLookup);
    if (!patient) {
      patient = await patientRepository.findById(patientLookup);
    }

    if (!patient) {
      throw new Error(`No patient record found for identifier: ${patientLookup}`);
    }

    // Retrieve ONLY the last two eligible prescriptions
    const eligiblePrescriptions = await prescriptionRepository.findPharmacistEligiblePrescriptions(patient.id);

    // Record pharmacy access event in immutable audit log
    await logAuditEvent({
      userId: pharmacist.id,
      userRole: pharmacist.role,
      organizationId: pharmacist.organizationId,
      patientId: patient.id,
      action: 'PHARMACY_PATIENT_LOOKUP',
      recordCategory: 'PRESCRIPTIONS',
      purpose: 'Prescription Verification & Dispensing Check',
    });

    // Run interaction check on active medications for safety overview
    const activeMedNames = eligiblePrescriptions.flatMap((p: any) => p.items.map((i: any) => i.medicationName));
    const interactionAlerts = checkDrugInteractions(activeMedNames);
    const patientAllergies = (patient.allergies || []).map((a: any) => a.allergen);
    const allergyWarnings = checkPatientAllergies(patientAllergies, activeMedNames);

    // Return strictly permitted pharmacist payload:
    // Patient name, SINA ID, allergies, and the 2 eligible prescriptions (NO full clinical encounters or unrelated reports)
    return {
      patient: {
        id: patient.id,
        sinaId: patient.sinaId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        allergies: (patient.allergies || []).map((a: any) => ({ allergen: a.allergen, severity: a.severity })),
      },
      prescriptions: eligiblePrescriptions,
      safetyOverview: {
        allergyWarnings,
        interactionAlerts,
      },
    };
  }

  async dispenseMedication(data: { prescriptionId: string; dispensedQty: number; dispensedNotes?: string }, pharmacist: { id: string; role: Role; organizationId: string }) {
    const prescription = await prescriptionRepository.findById(data.prescriptionId);
    if (!prescription) {
      throw new Error('Prescription not found.');
    }

    const dispensing = await prescriptionRepository.recordDispensing({
      prescriptionId: data.prescriptionId,
      pharmacistId: pharmacist.id,
      pharmacyId: pharmacist.organizationId,
      patientId: prescription.patient.id,
      dispensedQty: data.dispensedQty,
      dispensedNotes: data.dispensedNotes,
    });

    await logAuditEvent({
      userId: pharmacist.id,
      userRole: pharmacist.role,
      organizationId: pharmacist.organizationId,
      patientId: prescription.patient.id,
      action: 'DISPENSE_MEDICATION',
      recordCategory: 'PRESCRIPTIONS',
      purpose: 'Prescription Dispensing Fulfilled',
    });

    return dispensing;
  }
}

export const prescriptionService = new PrescriptionService();
