import prisma from '../config/prisma';
import { generatePatientSinaId } from '../utils/idGenerator';
import { isMockMode, mockStore } from '../utils/mockStore';

export class PatientRepository {
  async findById(id: string) {
    if (isMockMode) {
      const p = mockStore.patients.find(x => x.id === id);
      if (!p) return null;
      const org = mockStore.organizations.find(o => o.id === p.primaryFacilityId);
      return { ...p, primaryFacility: org };
    }
    return prisma.patient.findUnique({
      where: { id },
      include: {
        primaryFacility: { select: { id: true, name: true, type: true } },
        allergies: true,
        conditions: true,
        user: { select: { id: true, email: true, isActive: true } },
      },
    });
  }

  async findBySinaId(sinaId: string) {
    if (isMockMode) {
      const p = mockStore.patients.find(x => x.sinaId.toLowerCase() === sinaId.toLowerCase().trim());
      if (!p) return null;
      const org = mockStore.organizations.find(o => o.id === p.primaryFacilityId);
      return { ...p, primaryFacility: org };
    }
    return prisma.patient.findUnique({
      where: { sinaId },
      include: {
        primaryFacility: { select: { id: true, name: true, type: true } },
        allergies: true,
        conditions: true,
        user: { select: { id: true, email: true, isActive: true } },
      },
    });
  }

  async findByUserId(userId: string) {
    if (isMockMode) {
      const p = mockStore.patients.find(x => x.userId === userId);
      if (!p) return null;
      const org = mockStore.organizations.find(o => o.id === p.primaryFacilityId);
      return { ...p, primaryFacility: org };
    }
    return prisma.patient.findUnique({
      where: { userId },
      include: {
        primaryFacility: { select: { id: true, name: true } },
        allergies: true,
        conditions: true,
      },
    });
  }

  async searchPatients(query: string, limit = 20) {
    if (isMockMode) {
      const q = query.toLowerCase().trim();
      return mockStore.patients
        .filter(p => p.sinaId.toLowerCase().includes(q) || p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q) || p.phone.includes(q))
        .map(p => ({
          ...p,
          primaryFacility: mockStore.organizations.find(o => o.id === p.primaryFacilityId),
        }))
        .slice(0, limit);
    }
    return prisma.patient.findMany({
      where: {
        OR: [
          { sinaId: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
        ],
      },
      include: {
        primaryFacility: { select: { id: true, name: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    firstName: string;
    lastName: string;
    dob: Date;
    gender: string;
    bloodGroup?: string;
    phone: string;
    email?: string;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    primaryFacilityId?: string;
    allergies?: Array<{ allergen: string; severity: string; reaction: string }>;
    conditions?: Array<{ conditionName: string; icd10Code?: string; diagnosedDate: Date; status: string }>;
  }) {
    if (isMockMode) {
      const count = mockStore.patients.length + 1;
      const sinaId = `SINA-PAT-2026-${count.toString().padStart(6, '0')}`;
      const newPatient = {
        id: `pat-${Date.now()}`,
        sinaId,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        primaryFacilityId: data.primaryFacilityId || 'org-apex',
        allergies: data.allergies?.map((a, i) => ({ id: `all-${i}`, ...a })) || [],
        conditions: data.conditions?.map((c, i) => ({ id: `cond-${i}`, ...c })) || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.patients.unshift(newPatient);
      return newPatient;
    }

    const sinaId = await generatePatientSinaId();

    return prisma.patient.create({
      data: {
        sinaId,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        primaryFacilityId: data.primaryFacilityId,
        allergies: data.allergies ? {
          create: data.allergies.map(a => ({
            allergen: a.allergen,
            severity: a.severity,
            reaction: a.reaction,
          })),
        } : undefined,
        conditions: data.conditions ? {
          create: data.conditions.map(c => ({
            conditionName: c.conditionName,
            icd10Code: c.icd10Code,
            diagnosedDate: c.diagnosedDate,
            status: c.status,
          })),
        } : undefined,
      },
      include: {
        allergies: true,
        conditions: true,
        primaryFacility: true,
      },
    });
  }

  async getPatientTimeline(patientId: string) {
    if (isMockMode) {
      return mockStore.encounters
        .filter(e => e.patientId === patientId)
        .map(e => ({
          ...e,
          doctor: mockStore.users.find(u => u.id === e.doctorId),
          organization: mockStore.organizations.find(o => o.id === e.organizationId),
          department: mockStore.departments.find(d => d.id === e.departmentId),
          prescriptions: mockStore.prescriptions.filter(p => p.encounterId === e.id),
        }))
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    }

    const encounters = await prisma.encounter.findMany({
      where: { patientId },
      include: {
        doctor: { select: { id: true, firstName: true, lastName: true, specialty: true } },
        organization: { select: { id: true, name: true, type: true } },
        department: { select: { id: true, name: true } },
        diagnoses: true,
        investigations: true,
        prescriptions: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return encounters;
  }
}

export const patientRepository = new PatientRepository();
