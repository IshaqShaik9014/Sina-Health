import { consentRepository } from '../repositories/consent.repository';
import { patientRepository } from '../repositories/patient.repository';
import { logAuditEvent } from '../middleware/auditLogger';
import { Role } from '@prisma/client';

export class ConsentService {
  async createAccessRequest(data: {
    patientId: string;
    sourceOrgId: string;
    purpose: string;
    requestedCategories: string;
    durationDays?: number;
  }, doctor: { id: string; role: Role; organizationId: string }) {
    const patient = await patientRepository.findById(data.patientId);
    if (!patient) {
      throw new Error('Patient not found.');
    }

    const request = await consentRepository.createAccessRequest({
      patientId: data.patientId,
      requestingOrgId: doctor.organizationId,
      requestingDoctorId: doctor.id,
      sourceOrgId: data.sourceOrgId,
      purpose: data.purpose,
      requestedCategories: data.requestedCategories,
      durationDays: data.durationDays || 7,
    });

    await logAuditEvent({
      userId: doctor.id,
      userRole: doctor.role,
      organizationId: doctor.organizationId,
      patientId: patient.id,
      action: 'REQUEST_CROSS_HOSPITAL_ACCESS',
      recordCategory: 'CONSENT',
      purpose: data.purpose,
    });

    return request;
  }

  async getPatientRequests(patientId: string) {
    return consentRepository.findRequestsByPatient(patientId);
  }

  async getFacilityRequests(facilityId: string) {
    return consentRepository.findRequestsByFacility(facilityId);
  }

  async processPatientDecision(requestId: string, decision: 'APPROVE' | 'REJECT', allowedCategories?: string, patientUser?: { id: string; role: Role; patientId?: string }) {
    const req = await consentRepository.findRequestById(requestId);
    if (!req) {
      throw new Error('Access request not found.');
    }

    if (patientUser && patientUser.patientId && req.patientId !== patientUser.patientId) {
      throw new Error('Unauthorized to approve access for another patient.');
    }

    const updated = await consentRepository.updatePatientDecision(requestId, decision, allowedCategories);

    await logAuditEvent({
      userId: patientUser?.id || req.patientId,
      userRole: Role.PATIENT,
      organizationId: req.sourceOrgId,
      patientId: req.patientId,
      action: decision === 'APPROVE' ? 'PATIENT_CONSENT_APPROVED' : 'PATIENT_CONSENT_REJECTED',
      recordCategory: 'CONSENT',
      purpose: `Patient ${decision} access to categories: ${allowedCategories || req.requestedCategories}`,
    });

    return updated;
  }

  async processFacilityDecision(requestId: string, decision: 'APPROVE' | 'REJECT', hospitalAdmin: { id: string; role: Role; organizationId: string }) {
    const req = await consentRepository.findRequestById(requestId);
    if (!req) {
      throw new Error('Access request not found.');
    }

    if (req.sourceOrgId !== hospitalAdmin.organizationId && hospitalAdmin.role !== Role.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only the source facility holding the records can approve transfer.');
    }

    const result = await consentRepository.updateFacilityDecision(requestId, decision);

    await logAuditEvent({
      userId: hospitalAdmin.id,
      userRole: hospitalAdmin.role,
      organizationId: hospitalAdmin.organizationId,
      patientId: req.patientId,
      action: decision === 'APPROVE' ? 'FACILITY_TRANSFER_APPROVED' : 'FACILITY_TRANSFER_REJECTED',
      recordCategory: 'CONSENT',
      purpose: `Hospital verification ${decision}`,
    });

    return result;
  }

  async revokeAccessGrant(grantId: string, revoker: { id: string; role: Role; patientId?: string; organizationId?: string | null }) {
    const revoked = await consentRepository.revokeAccessGrant(grantId);

    await logAuditEvent({
      userId: revoker.id,
      userRole: revoker.role,
      organizationId: revoker.organizationId || 'SYSTEM',
      patientId: revoked.patientId,
      action: 'ACCESS_GRANT_REVOKED',
      recordCategory: 'CONSENT',
      purpose: 'Immediate authorization revocation by patient',
    });

    return revoked;
  }
}

export const consentService = new ConsentService();
