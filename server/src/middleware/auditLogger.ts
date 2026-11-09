import { AuditStatus, Role } from '@prisma/client';
import prisma from '../config/prisma';
import { isMockMode, mockStore } from '../utils/mockStore';

export interface LogAuditEventParams {
  userId: string;
  userRole: Role;
  organizationId: string;
  patientId?: string;
  action: string;
  recordCategory: string;
  purpose?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditStatus;
}

export async function logAuditEvent(params: LogAuditEventParams): Promise<void> {
  try {
    if (isMockMode) {
      mockStore.auditLogs.unshift({
        id: `log-${Date.now()}`,
        userId: params.userId,
        userRole: params.userRole,
        organizationId: params.organizationId,
        patientId: params.patientId || null,
        action: params.action,
        recordCategory: params.recordCategory,
        purpose: params.purpose || 'Clinical Operations',
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        status: params.status || 'SUCCESS',
        timestamp: new Date(),
      });
      return;
    }

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userRole: params.userRole,
        organizationId: params.organizationId,
        patientId: params.patientId || null,
        action: params.action,
        recordCategory: params.recordCategory,
        purpose: params.purpose || 'Clinical Care / Operations',
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        status: params.status || AuditStatus.SUCCESS,
      },
    });
  } catch (error) {
    console.error('Audit log write error:', error);
  }
}
