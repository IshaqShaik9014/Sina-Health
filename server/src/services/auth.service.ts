import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { ENV } from '../config/env';
import { Role } from '@prisma/client';
import { isMockMode, mockStore } from '../utils/mockStore';

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
}

export const authService = new AuthService();
