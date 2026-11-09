import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { ENV } from '../config/env';
import { Role, OrgStatus } from '@prisma/client';
import { isMockMode, mockStore } from '../utils/mockStore';
import { generatePatientSinaId } from '../utils/idGenerator';

export class AuthService {
  async login(email: string, passwordPlain: string) {
    let user: any;

    if (isMockMode) {
      const found = mockStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (found) {
        const org = mockStore.organizations.find(o => o.id === found.organizationId);
        const pat = mockStore.patients.find(p => p.userId === found.id);
        user = {
          ...found,
          organization: org,
          patientProfile: pat ? { id: pat.id, sinaId: pat.sinaId } : null,
        };
      }
    } else {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              pharmacyType: true,
            },
          },
          patientProfile: {
            select: {
              id: true,
              sinaId: true,
            },
          },
        },
      });
    }

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new Error('This account has been deactivated. Please contact your facility administrator.');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      firstName: user.firstName,
      lastName: user.lastName,
      patientId: user.patientProfile?.id,
      sinaId: user.patientProfile?.sinaId,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: '7d',
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        licenseNumber: user.licenseNumber,
        specialty: user.specialty,
        organization: user.organization,
        patientProfile: user.patientProfile,
      },
    };
  }

  async getCurrentUser(userId: string) {
    let user: any;

    if (isMockMode) {
      const found = mockStore.users.find(u => u.id === userId);
      if (found) {
        const org = mockStore.organizations.find(o => o.id === found.organizationId);
        const pat = mockStore.patients.find(p => p.userId === found.id);
        user = {
          ...found,
          organization: org,
          patientProfile: pat ? { id: pat.id, sinaId: pat.sinaId } : null,
        };
      }
    } else {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              pharmacyType: true,
            },
          },
          patientProfile: {
            select: {
              id: true,
              sinaId: true,
            },
          },
        },
      });
    }

    if (!user) {
      throw new Error('User not found.');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      licenseNumber: user.licenseNumber,
      specialty: user.specialty,
      organization: user.organization,
      patientProfile: user.patientProfile,
    };
  }

  async getPublicFacilities() {
    if (isMockMode) {
      return mockStore.organizations.map(o => ({
        id: o.id,
        name: o.name,
        type: o.type,
        pharmacyType: o.pharmacyType,
        address: o.address,
      }));
    }

    return prisma.organization.findMany({
      where: { status: OrgStatus.APPROVED },
      select: {
        id: true,
        name: true,
        type: true,
        pharmacyType: true,
        address: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async registerPatient(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    bloodGroup?: string;
    phone: string;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    primaryFacilityId?: string;
    allergies?: Array<{ allergen: string; severity: string; reaction: string }>;
  }) {
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check duplicate
    if (isMockMode) {
      const existing = mockStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        throw new Error('An account with this email address already exists. Please log in.');
      }
    } else {
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existing) {
        throw new Error('An account with this email address already exists. Please log in.');
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    if (isMockMode) {
      const count = mockStore.patients.length + 1;
      const sinaId = `SINA-PAT-2026-${count.toString().padStart(6, '0')}`;
      const userId = `usr-pat-${Date.now()}`;
      const patId = `pat-${Date.now()}`;

      const userRecord = {
        id: userId,
        email: normalizedEmail,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: Role.PATIENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.users.push(userRecord);

      const patientRecord = {
        id: patId,
        userId,
        sinaId,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: new Date(data.dob),
        gender: data.gender,
        bloodGroup: data.bloodGroup || 'O+',
        phone: data.phone,
        email: normalizedEmail,
        address: data.address,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        primaryFacilityId: data.primaryFacilityId || 'org-apex',
        allergies: data.allergies?.map((a, i) => ({ id: `all-${i}`, ...a })) || [],
        conditions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.patients.unshift(patientRecord);

      const token = jwt.sign(
        {
          id: userId,
          email: normalizedEmail,
          role: Role.PATIENT,
          firstName: data.firstName,
          lastName: data.lastName,
          patientId: patId,
          sinaId,
        },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: userId,
          email: normalizedEmail,
          firstName: data.firstName,
          lastName: data.lastName,
          role: Role.PATIENT,
          patientProfile: { id: patId, sinaId },
        },
        patient: patientRecord,
      };
    }

    // Neon PostgreSQL Prisma transaction
    const sinaId = await generatePatientSinaId();

    return prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: Role.PATIENT,
        },
      });

      const patient = await tx.patient.create({
        data: {
          sinaId,
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          dob: new Date(data.dob),
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          phone: data.phone,
          email: normalizedEmail,
          address: data.address,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          primaryFacilityId: data.primaryFacilityId || null,
          allergies: data.allergies && data.allergies.length > 0 ? {
            create: data.allergies.map(a => ({
              allergen: a.allergen,
              severity: a.severity,
              reaction: a.reaction,
            })),
          } : undefined,
        },
        include: {
          allergies: true,
          primaryFacility: { select: { id: true, name: true } },
        },
      });

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          patientId: patient.id,
          sinaId: patient.sinaId,
        },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          patientProfile: {
            id: patient.id,
            sinaId: patient.sinaId,
          },
        },
        patient,
      };
    });
  }

  async registerStaff(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
    organizationId?: string;
    licenseNumber: string;
    specialty?: string;
  }) {
    const normalizedEmail = data.email.toLowerCase().trim();

    if (isMockMode) {
      const existing = mockStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        throw new Error('An account with this email address already exists. Please log in.');
      }
      const userId = `usr-staff-${Date.now()}`;
      const userRecord = {
        id: userId,
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(data.password, 10),
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        organizationId: data.organizationId || 'org-apex',
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        specialty: data.specialty,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.users.push(userRecord);

      const org = mockStore.organizations.find(o => o.id === userRecord.organizationId);
      const token = jwt.sign(
        {
          id: userId,
          email: normalizedEmail,
          role: data.role,
          organizationId: userRecord.organizationId,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          ...userRecord,
          organization: org,
        },
      };
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        organizationId: data.organizationId || null,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        specialty: data.specialty,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            pharmacyType: true,
          },
        },
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user,
    };
  }
}

export const authService = new AuthService();
