import { patientRepository } from '../repositories/patient.repository';
import { consentRepository } from '../repositories/consent.repository';
import { logAuditEvent } from '../middleware/auditLogger';
import { Role } from '@prisma/client';

export class PatientService {
  async registerPatient(data: any, registeringUser: { id: string; role: Role; organizationId?: string | null }) {
    const patient = await patientRepository.create({
      ...data,
      dob: new Date(data.dob),
      primaryFacilityId: registeringUser.organizationId || undefined,
      conditions: data.existingConditions?.map((c: any) => ({
        ...c,
        diagnosedDate: new Date(c.diagnosedDate),
      })),
    });

    if (registeringUser.organizationId) {
      await logAuditEvent({
        userId: registeringUser.id,
        userRole: registeringUser.role,
        organizationId: registeringUser.organizationId,
        patientId: patient.id,
        action: 'REGISTER_PATIENT',
        recordCategory: 'DEMOGRAPHICS',
        purpose: 'Patient Onboarding',
      });
    }

    return patient;
  }

  async searchPatients(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return patientRepository.searchPatients(query.trim());
  }

  async getPatientProfile(patientIdOrSinaId: string, requestingUser: { id: string; role: Role; organizationId?: string | null; patientId?: string }) {
    let patient = await patientRepository.findById(patientIdOrSinaId);
    if (!patient) {
      patient = await patientRepository.findBySinaId(patientIdOrSinaId);
    }

    if (!patient) {
      throw new Error('Patient record not found.');
    }

    // Role-based Access check:
    // If user is a patient, they can only view their own profile
    if (requestingUser.role === Role.PATIENT) {
      if (requestingUser.patientId !== patient.id) {
        throw new Error('Unauthorized: Patients can only view their own medical profile.');
      }
    }

    // If user is a doctor or hospital admin from another facility, check if primaryFacility matches OR if active grant exists
    if (requestingUser.role === Role.DOCTOR && requestingUser.organizationId) {
      if (patient.primaryFacilityId !== requestingUser.organizationId) {
        const activeGrant = await consentRepository.checkActiveGrant(patient.id, requestingUser.organizationId);
        if (!activeGrant) {
          return {
            patient: {
              id: patient.id,
              sinaId: patient.sinaId,
              firstName: patient.firstName,
              lastName: patient.lastName,
              gender: patient.gender,
              primaryFacility: patient.primaryFacility,
            },
            requiresConsentRequest: true,
            message: `External Facility Records: This patient was registered at ${patient.primaryFacility?.name || 'another facility'}. You must submit a cross-hospital consent request to access clinical records.`,
          };
        }
      }
    }

    // Log the read event
    if (requestingUser.organizationId) {
      await logAuditEvent({
        userId: requestingUser.id,
        userRole: requestingUser.role,
        organizationId: requestingUser.organizationId,
        patientId: patient.id,
        action: 'VIEW_PATIENT_PROFILE',
        recordCategory: 'DEMOGRAPHICS',
      });
    }

    return { patient, requiresConsentRequest: false };
  }

  async getPatientTimeline(patientId: string, requestingUser: { id: string; role: Role; organizationId?: string | null; patientId?: string }) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new Error('Patient not found.');
    }

    // Patient role check
    if (requestingUser.role === Role.PATIENT && requestingUser.patientId !== patient.id) {
      throw new Error('Unauthorized.');
    }

    // Doctor cross-facility check
    if (requestingUser.role === Role.DOCTOR && requestingUser.organizationId) {
      if (patient.primaryFacilityId !== requestingUser.organizationId) {
        const activeGrant = await consentRepository.checkActiveGrant(patient.id, requestingUser.organizationId);
        if (!activeGrant) {
          throw new Error('Access Denied: Cross-hospital clinical records require active patient and facility consent.');
        }
      }
    }

    const timeline = await patientRepository.getPatientTimeline(patientId);

    if (requestingUser.organizationId) {
      await logAuditEvent({
        userId: requestingUser.id,
        userRole: requestingUser.role,
        organizationId: requestingUser.organizationId,
        patientId: patient.id,
        action: 'VIEW_PATIENT_TIMELINE',
        recordCategory: 'CLINICAL_ENCOUNTER',
      });
    }

    return timeline;
  }
}

export const patientService = new PatientService();
