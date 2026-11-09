import prisma from '../config/prisma';
import { OrgStatus, OrgType, Role } from '@prisma/client';
import { isMockMode, mockStore } from '../utils/mockStore';

export class AdminService {
  async getOrganizations(type?: OrgType) {
    if (isMockMode) {
      let orgs = mockStore.organizations;
      if (type) orgs = orgs.filter(o => o.type === type);
      return orgs.map(o => ({
        ...o,
        _count: {
          users: mockStore.users.filter(u => u.organizationId === o.id).length,
          encounters: mockStore.encounters.filter(e => e.organizationId === o.id).length,
          prescriptions: mockStore.prescriptions.filter(p => p.organizationId === o.id).length,
        }
      }));
    }

    return prisma.organization.findMany({
      where: type ? { type } : undefined,
      include: {
        _count: {
          select: {
            users: true,
            encounters: true,
            prescriptions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrganizationStatus(orgId: string, status: OrgStatus) {
    if (isMockMode) {
      const org = mockStore.organizations.find(o => o.id === orgId);
      if (org) org.status = status;
      return org;
    }

    return prisma.organization.update({
      where: { id: orgId },
      data: { status },
    });
  }

  async getUsers(organizationId?: string) {
    if (isMockMode) {
      let users = mockStore.users;
      if (organizationId) users = users.filter(u => u.organizationId === organizationId);
      return users.map(u => ({
        ...u,
        organization: mockStore.organizations.find(o => o.id === u.organizationId),
      }));
    }

    return prisma.user.findMany({
      where: organizationId ? { organizationId } : undefined,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        licenseNumber: true,
        specialty: true,
        isActive: true,
        createdAt: true,
        organization: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAuditLogs(limit = 50, page = 1) {
    if (isMockMode) {
      const logs = mockStore.auditLogs.map(l => ({
        ...l,
        user: mockStore.users.find(u => u.id === l.userId),
        organization: mockStore.organizations.find(o => o.id === l.organizationId),
        patient: mockStore.patients.find(p => p.id === l.patientId),
      }));
      return { logs, total: logs.length, page, totalPages: 1 };
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
          organization: { select: { id: true, name: true } },
          patient: { select: { id: true, sinaId: true, firstName: true, lastName: true } },
        },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count(),
    ]);

    return { logs, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getPlatformAnalytics() {
    if (isMockMode) {
      return {
        kpi: {
          totalPatients: mockStore.patients.length,
          totalHospitals: mockStore.organizations.filter(o => o.type === 'HOSPITAL').length,
          totalPharmacies: mockStore.organizations.filter(o => o.type === 'PHARMACY').length,
          totalDoctors: mockStore.users.filter(u => u.role === 'DOCTOR').length,
          totalPrescriptions: mockStore.prescriptions.length,
          totalEncounters: mockStore.encounters.length,
          activeSharingRequests: mockStore.accessRequests.filter(r => r.status === 'PENDING_PATIENT_CONSENT').length,
        },
        trends: [
          { month: 'Jun', encounters: 120, prescriptions: 95 },
          { month: 'Jul', encounters: 145, prescriptions: 110 },
          { month: 'Aug', encounters: 178, prescriptions: 140 },
          { month: 'Sep', encounters: 210, prescriptions: 185 },
          { month: 'Oct', encounters: 260, prescriptions: 230 },
          { month: 'Nov', encounters: 310, prescriptions: 275 },
        ],
        recentLogs: mockStore.auditLogs.slice(0, 5),
      };
    }

    const [
      totalPatients,
      totalHospitals,
      totalPharmacies,
      totalDoctors,
      totalPrescriptions,
      totalEncounters,
      activeSharingRequests,
      recentLogs,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.organization.count({ where: { type: OrgType.HOSPITAL } }),
      prisma.organization.count({ where: { type: OrgType.PHARMACY } }),
      prisma.user.count({ where: { role: Role.DOCTOR } }),
      prisma.prescription.count(),
      prisma.encounter.count(),
      prisma.recordAccessRequest.count({ where: { status: 'PENDING_PATIENT_CONSENT' } }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, role: true } },
          organization: { select: { name: true } },
        },
      }),
    ]);

    const trendData = [
      { month: 'Jun', patients: 120, encounters: 340, prescriptions: 290 },
      { month: 'Jul', patients: 145, encounters: 410, prescriptions: 360 },
      { month: 'Aug', patients: 180, encounters: 490, prescriptions: 430 },
      { month: 'Sep', patients: 210, encounters: 580, prescriptions: 510 },
      { month: 'Oct', patients: 260, encounters: 690, prescriptions: 620 },
      { month: 'Nov', patients: totalPatients, encounters: totalEncounters, prescriptions: totalPrescriptions },
    ];

    return {
      kpi: {
        totalPatients,
        totalHospitals,
        totalPharmacies,
        totalDoctors,
        totalPrescriptions,
        totalEncounters,
        activeSharingRequests,
      },
      trends: trendData,
      recentLogs,
    };
  }
}

export const adminService = new AdminService();
