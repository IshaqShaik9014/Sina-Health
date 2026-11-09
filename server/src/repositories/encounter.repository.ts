import prisma from '../config/prisma';
import { EncounterType } from '@prisma/client';
import { isMockMode, mockStore } from '../utils/mockStore';

export class EncounterRepository {
  async findById(id: string) {
    if (isMockMode) {
      const enc = mockStore.encounters.find(e => e.id === id);
      if (!enc) return null;
      return {
        ...enc,
        patient: mockStore.patients.find(p => p.id === enc.patientId),
        doctor: mockStore.users.find(u => u.id === enc.doctorId),
        organization: mockStore.organizations.find(o => o.id === enc.organizationId),
        department: mockStore.departments.find(d => d.id === enc.departmentId),
        prescriptions: mockStore.prescriptions.filter(p => p.encounterId === enc.id),
      };
    }

    return prisma.encounter.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            allergies: true,
            conditions: true,
          }
        },
        doctor: { select: { id: true, firstName: true, lastName: true, specialty: true } },
        organization: { select: { id: true, name: true, type: true } },
        department: { select: { id: true, name: true } },
        diagnoses: true,
        investigations: true,
        prescriptions: {
          include: {
            items: true,
          }
        }
      }
    });
  }

  async findByPatientId(patientId: string) {
    if (isMockMode) {
      return mockStore.encounters
        .filter(e => e.patientId === patientId)
        .map(enc => ({
          ...enc,
          doctor: mockStore.users.find(u => u.id === enc.doctorId),
          organization: mockStore.organizations.find(o => o.id === enc.organizationId),
          department: mockStore.departments.find(d => d.id === enc.departmentId),
          prescriptions: mockStore.prescriptions.filter(p => p.encounterId === enc.id),
        }));
    }

    return prisma.encounter.findMany({
      where: { patientId },
      include: {
        doctor: { select: { id: true, firstName: true, lastName: true, specialty: true } },
        organization: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        diagnoses: true,
        investigations: true,
        prescriptions: {
          include: { items: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async create(data: {
    patientId: string;
    doctorId: string;
    organizationId: string;
    departmentId?: string;
    encounterType: EncounterType;
    chiefComplaint: string;
    bpSys?: number;
    bpDia?: number;
    heartRate?: number;
    tempCelsius?: number;
    respRate?: number;
    o2Saturation?: number;
    physicalExam?: string;
    treatmentPlan?: string;
    notes?: string;
    diagnoses?: Array<{ code: string; description: string; isDefinitive?: boolean }>;
    investigations?: Array<{ testName: string; category: string }>;
  }) {
    if (isMockMode) {
      const encId = `enc-${Date.now()}`;
      const newEnc = {
        id: encId,
        ...data,
        startedAt: new Date(),
        diagnoses: data.diagnoses?.map((d, i) => ({ id: `diag-${Date.now()}-${i}`, ...d })) || [],
        investigations: data.investigations?.map((inv, i) => ({ id: `inv-${Date.now()}-${i}`, ...inv, status: 'ORDERED' })) || [],
        doctor: mockStore.users.find(u => u.id === data.doctorId),
        organization: mockStore.organizations.find(o => o.id === data.organizationId),
      };
      mockStore.encounters.unshift(newEnc);
      return newEnc;
    }

    return prisma.encounter.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        organizationId: data.organizationId,
        departmentId: data.departmentId,
        encounterType: data.encounterType,
        chiefComplaint: data.chiefComplaint,
        bpSys: data.bpSys,
        bpDia: data.bpDia,
        heartRate: data.heartRate,
        tempCelsius: data.tempCelsius,
        respRate: data.respRate,
        o2Saturation: data.o2Saturation,
        physicalExam: data.physicalExam,
        treatmentPlan: data.treatmentPlan,
        notes: data.notes,
        diagnoses: data.diagnoses ? {
          create: data.diagnoses.map(d => ({
            patientId: data.patientId,
            code: d.code,
            description: d.description,
            isDefinitive: d.isDefinitive || false,
          })),
        } : undefined,
        investigations: data.investigations ? {
          create: data.investigations.map(inv => ({
            patientId: data.patientId,
            testName: inv.testName,
            category: inv.category,
            status: 'ORDERED',
          })),
        } : undefined,
      },
      include: {
        diagnoses: true,
        investigations: true,
        doctor: { select: { id: true, firstName: true, lastName: true } },
        organization: { select: { id: true, name: true } },
      },
    });
  }
}

export const encounterRepository = new EncounterRepository();
