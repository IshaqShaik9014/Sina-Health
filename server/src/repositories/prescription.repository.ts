import prisma from '../config/prisma';
import { PrescriptionStatus } from '@prisma/client';
import { isMockMode, mockStore } from '../utils/mockStore';

export class PrescriptionRepository {
  async findById(id: string) {
    if (isMockMode) {
      const rx = mockStore.prescriptions.find(p => p.id === id);
      if (!rx) return null;
      return {
        ...rx,
        patient: mockStore.patients.find(p => p.id === rx.patientId),
        doctor: mockStore.users.find(u => u.id === rx.doctorId),
        organization: mockStore.organizations.find(o => o.id === rx.organizationId),
        dispensings: mockStore.dispensings.filter(d => d.prescriptionId === rx.id),
      };
    }

    return prisma.prescription.findUnique({
      where: { id },
      include: {
        items: true,
        patient: {
          select: {
            id: true,
            sinaId: true,
            firstName: true,
            lastName: true,
            allergies: true,
          },
        },
        doctor: { select: { id: true, firstName: true, lastName: true, licenseNumber: true } },
        organization: { select: { id: true, name: true, phone: true } },
        dispensings: {
          include: {
            pharmacist: { select: { id: true, firstName: true, lastName: true } },
            pharmacy: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async findByPatientId(patientId: string) {
    if (isMockMode) {
      return mockStore.prescriptions
        .filter(p => p.patientId === patientId)
        .map(rx => ({
          ...rx,
          doctor: mockStore.users.find(u => u.id === rx.doctorId),
          organization: mockStore.organizations.find(o => o.id === rx.organizationId),
          dispensings: mockStore.dispensings.filter(d => d.prescriptionId === rx.id),
        }));
    }

    return prisma.prescription.findMany({
      where: { patientId },
      include: {
        items: true,
        doctor: { select: { id: true, firstName: true, lastName: true } },
        organization: { select: { id: true, name: true } },
        dispensings: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Strict Pharmacist limit: Only last two eligible prescriptions
  async findPharmacistEligiblePrescriptions(patientId: string) {
    if (isMockMode) {
      return mockStore.prescriptions
        .filter(p => p.patientId === patientId && (p.status === 'ACTIVE' || p.status === 'PARTIALLY_DISPENSED'))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2)
        .map(rx => ({
          ...rx,
          doctor: mockStore.users.find(u => u.id === rx.doctorId),
          organization: mockStore.organizations.find(o => o.id === rx.organizationId),
          dispensings: mockStore.dispensings.filter(d => d.prescriptionId === rx.id),
        }));
    }

    return prisma.prescription.findMany({
      where: {
        patientId,
        status: { in: [PrescriptionStatus.ACTIVE, PrescriptionStatus.PARTIALLY_DISPENSED] },
      },
      include: {
        items: true,
        doctor: { select: { id: true, firstName: true, lastName: true, licenseNumber: true } },
        organization: { select: { id: true, name: true, phone: true } },
        dispensings: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });
  }

  async create(data: {
    patientId: string;
    doctorId: string;
    organizationId: string;
    encounterId?: string;
    notes?: string;
    items: Array<{
      medicationName: string;
      genericName?: string;
      strength: string;
      dosage: string;
      frequency: string;
      route: string;
      durationDays: number;
      quantity: number;
      instructions?: string;
    }>;
  }) {
    if (isMockMode) {
      const rxId = `rx-${Date.now()}`;
      const newRx = {
        id: rxId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        organizationId: data.organizationId,
        encounterId: data.encounterId,
        status: 'ACTIVE',
        notes: data.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: data.items.map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          prescriptionId: rxId,
          ...item,
          remainingQty: item.quantity,
        })),
        doctor: mockStore.users.find(u => u.id === data.doctorId),
        organization: mockStore.organizations.find(o => o.id === data.organizationId),
      };
      mockStore.prescriptions.unshift(newRx);
      return newRx;
    }

    return prisma.prescription.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        organizationId: data.organizationId,
        encounterId: data.encounterId,
        status: PrescriptionStatus.ACTIVE,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            medicationName: item.medicationName,
            genericName: item.genericName,
            strength: item.strength,
            dosage: item.dosage,
            frequency: item.frequency,
            route: item.route,
            durationDays: item.durationDays,
            quantity: item.quantity,
            instructions: item.instructions,
            remainingQty: item.quantity,
          })),
        },
      },
      include: {
        items: true,
        doctor: { select: { id: true, firstName: true, lastName: true } },
        organization: { select: { id: true, name: true } },
      },
    });
  }

  async recordDispensing(data: {
    prescriptionId: string;
    pharmacistId: string;
    pharmacyId: string;
    patientId: string;
    dispensedQty: number;
    dispensedNotes?: string;
  }) {
    if (isMockMode) {
      const dispensing = {
        id: `disp-${Date.now()}`,
        ...data,
        dispensedAt: new Date(),
      };
      mockStore.dispensings.push(dispensing);

      const rx = mockStore.prescriptions.find(p => p.id === data.prescriptionId);
      if (rx) {
        let allCompleted = true;
        for (const item of rx.items) {
          item.remainingQty = Math.max(0, item.remainingQty - data.dispensedQty);
          if (item.remainingQty > 0) allCompleted = false;
        }
        rx.status = allCompleted ? 'DISPENSED' : 'PARTIALLY_DISPENSED';
      }
      return dispensing;
    }

    return prisma.$transaction(async (tx: any) => {
      const dispensing = await tx.dispensingRecord.create({
        data: {
          prescriptionId: data.prescriptionId,
          pharmacistId: data.pharmacistId,
          pharmacyId: data.pharmacyId,
          patientId: data.patientId,
          dispensedQty: data.dispensedQty,
          dispensedNotes: data.dispensedNotes,
        },
      });

      const items = await tx.prescriptionItem.findMany({
        where: { prescriptionId: data.prescriptionId },
      });

      let allCompleted = true;
      for (const item of items) {
        const newRemaining = Math.max(0, item.remainingQty - data.dispensedQty);
        await tx.prescriptionItem.update({
          where: { id: item.id },
          data: { remainingQty: newRemaining },
        });
        if (newRemaining > 0) {
          allCompleted = false;
        }
      }

      await tx.prescription.update({
        where: { id: data.prescriptionId },
        data: {
          status: allCompleted ? PrescriptionStatus.DISPENSED : PrescriptionStatus.PARTIALLY_DISPENSED,
        },
      });

      return dispensing;
    });
  }
}

export const prescriptionRepository = new PrescriptionRepository();
