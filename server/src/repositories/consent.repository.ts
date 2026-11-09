import prisma from '../config/prisma';
import { RequestStatus } from '@prisma/client';
import { isMockMode, mockStore } from '../utils/mockStore';

export class ConsentRepository {
  async createAccessRequest(data: {
    patientId: string;
    requestingOrgId: string;
    requestingDoctorId: string;
    sourceOrgId: string;
    purpose: string;
    requestedCategories: string;
    durationDays: number;
  }) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.durationDays);

    if (isMockMode) {
      const newReq = {
        id: `req-${Date.now()}`,
        ...data,
        expiresAt,
        status: 'PENDING_PATIENT_CONSENT',
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockStore.patients.find(p => p.id === data.patientId),
        requestingOrg: mockStore.organizations.find(o => o.id === data.requestingOrgId),
        requestingDoctor: mockStore.users.find(u => u.id === data.requestingDoctorId),
        sourceOrg: mockStore.organizations.find(o => o.id === data.sourceOrgId),
      };
      mockStore.accessRequests.unshift(newReq);
      return newReq;
    }

    return prisma.recordAccessRequest.create({
      data: {
        patientId: data.patientId,
        requestingOrgId: data.requestingOrgId,
        requestingDoctorId: data.requestingDoctorId,
        sourceOrgId: data.sourceOrgId,
        purpose: data.purpose,
        requestedCategories: data.requestedCategories,
        expiresAt,
        status: RequestStatus.PENDING_PATIENT_CONSENT,
      },
      include: {
        patient: { select: { id: true, sinaId: true, firstName: true, lastName: true } },
        requestingOrg: { select: { id: true, name: true } },
        requestingDoctor: { select: { id: true, firstName: true, lastName: true, specialty: true } },
        sourceOrg: { select: { id: true, name: true } },
      },
    });
  }

  async findRequestById(id: string) {
    if (isMockMode) {
      const req = mockStore.accessRequests.find(r => r.id === id);
      if (!req) return null;
      return {
        ...req,
        patient: mockStore.patients.find(p => p.id === req.patientId),
        requestingOrg: mockStore.organizations.find(o => o.id === req.requestingOrgId),
        requestingDoctor: mockStore.users.find(u => u.id === req.requestingDoctorId),
        sourceOrg: mockStore.organizations.find(o => o.id === req.sourceOrgId),
        accessGrant: mockStore.accessGrants.find(g => g.requestId === req.id),
      };
    }

    return prisma.recordAccessRequest.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, sinaId: true, firstName: true, lastName: true } },
        requestingOrg: { select: { id: true, name: true } },
        requestingDoctor: { select: { id: true, firstName: true, lastName: true } },
        sourceOrg: { select: { id: true, name: true } },
        accessGrant: true,
      },
    });
  }

  async findRequestsByPatient(patientId: string) {
    if (isMockMode) {
      return mockStore.accessRequests
        .filter(r => r.patientId === patientId)
        .map(req => ({
          ...req,
          requestingOrg: mockStore.organizations.find(o => o.id === req.requestingOrgId),
          requestingDoctor: mockStore.users.find(u => u.id === req.requestingDoctorId),
          sourceOrg: mockStore.organizations.find(o => o.id === req.sourceOrgId),
          accessGrant: mockStore.accessGrants.find(g => g.requestId === req.id),
        }));
    }

    return prisma.recordAccessRequest.findMany({
      where: { patientId },
      include: {
        requestingOrg: { select: { id: true, name: true } },
        requestingDoctor: { select: { id: true, firstName: true, lastName: true, specialty: true } },
        sourceOrg: { select: { id: true, name: true } },
        accessGrant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRequestsByFacility(facilityId: string) {
    if (isMockMode) {
      return mockStore.accessRequests
        .filter(r => r.requestingOrgId === facilityId || r.sourceOrgId === facilityId)
        .map(req => ({
          ...req,
          patient: mockStore.patients.find(p => p.id === req.patientId),
          requestingOrg: mockStore.organizations.find(o => o.id === req.requestingOrgId),
          sourceOrg: mockStore.organizations.find(o => o.id === req.sourceOrgId),
        }));
    }

    return prisma.recordAccessRequest.findMany({
      where: {
        OR: [
          { requestingOrgId: facilityId },
          { sourceOrgId: facilityId },
        ],
      },
      include: {
        patient: { select: { id: true, sinaId: true, firstName: true, lastName: true } },
        requestingOrg: { select: { id: true, name: true } },
        sourceOrg: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePatientDecision(requestId: string, decision: 'APPROVE' | 'REJECT', allowedCategories?: string) {
    const status = decision === 'APPROVE' 
      ? 'PENDING_FACILITY_APPROVAL' 
      : 'PATIENT_REJECTED';

    if (isMockMode) {
      const req = mockStore.accessRequests.find(r => r.id === requestId);
      if (req) {
        req.status = status;
        req.patientDecisionAt = new Date();
        if (allowedCategories) req.requestedCategories = allowedCategories;
      }
      return req;
    }

    return prisma.recordAccessRequest.update({
      where: { id: requestId },
      data: {
        status: status as any,
        patientDecisionAt: new Date(),
        requestedCategories: allowedCategories || undefined,
      },
      include: {
        patient: true,
        requestingOrg: true,
      },
    });
  }

  async updateFacilityDecision(requestId: string, decision: 'APPROVE' | 'REJECT') {
    if (isMockMode) {
      const req = mockStore.accessRequests.find(r => r.id === requestId);
      if (!req) throw new Error('Request not found');
      if (decision === 'REJECT') {
        req.status = 'FACILITY_REJECTED';
        req.facilityDecisionAt = new Date();
        return req;
      }
      req.status = 'FACILITY_APPROVED';
      req.facilityDecisionAt = new Date();
      const grant = {
        id: `grant-${Date.now()}`,
        requestId: req.id,
        patientId: req.patientId,
        grantedOrgId: req.requestingOrgId,
        allowedCategories: req.requestedCategories,
        validFrom: new Date(),
        validUntil: req.expiresAt,
        isRevoked: false,
      };
      mockStore.accessGrants.push(grant);
      return { request: req, grant };
    }

    if (decision === 'REJECT') {
      return prisma.recordAccessRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.FACILITY_REJECTED,
          facilityDecisionAt: new Date(),
        },
      });
    }

    return prisma.$transaction(async (tx) => {
      const updatedReq = await tx.recordAccessRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.FACILITY_APPROVED,
          facilityDecisionAt: new Date(),
        },
      });

      const grant = await tx.accessGrant.create({
        data: {
          requestId: updatedReq.id,
          patientId: updatedReq.patientId,
          grantedOrgId: updatedReq.requestingOrgId,
          allowedCategories: updatedReq.requestedCategories,
          validFrom: new Date(),
          validUntil: updatedReq.expiresAt,
        },
      });

      return { request: updatedReq, grant };
    });
  }

  async revokeAccessGrant(grantId: string) {
    if (isMockMode) {
      const grant = mockStore.accessGrants.find(g => g.id === grantId);
      if (grant) {
        grant.isRevoked = true;
        grant.revokedAt = new Date();
      }
      return grant;
    }

    return prisma.accessGrant.update({
      where: { id: grantId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  }

  async checkActiveGrant(patientId: string, orgId: string) {
    if (isMockMode) {
      return mockStore.accessGrants.find(g => g.patientId === patientId && g.grantedOrgId === orgId && !g.isRevoked && new Date(g.validUntil) > new Date());
    }

    const grant = await prisma.accessGrant.findFirst({
      where: {
        patientId,
        grantedOrgId: orgId,
        isRevoked: false,
        validUntil: { gt: new Date() },
      },
    });

    return grant;
  }
}

export const consentRepository = new ConsentRepository();
