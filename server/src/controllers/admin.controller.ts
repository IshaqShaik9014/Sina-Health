import { Response } from 'express';
import { adminService } from '../services/admin.service';
import { AuthRequest } from '../types';
import { OrgStatus, OrgType } from '@prisma/client';

export class AdminController {
  async getOrganizations(req: AuthRequest, res: Response) {
    try {
      const type = req.query.type as OrgType | undefined;
      const orgs = await adminService.getOrganizations(type);
      res.status(200).json({ success: true, data: orgs });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateOrganizationStatus(req: AuthRequest, res: Response) {
    try {
      const { orgId } = req.params;
      const { status } = req.body;
      const updated = await adminService.updateOrganizationStatus(orgId, status as OrgStatus);
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getUsers(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.query.organizationId as string | undefined;
      const users = await adminService.getUsers(organizationId);
      res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await adminService.getAuditLogs(limit, page);
      res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAnalytics(_req: AuthRequest, res: Response) {
    try {
      const analytics = await adminService.getPlatformAnalytics();
      res.status(200).json({ success: true, data: analytics });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const adminController = new AdminController();
