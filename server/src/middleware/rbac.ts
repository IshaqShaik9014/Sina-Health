import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Role "${req.user.role}" does not have required permissions.`,
      });
      return;
    }

    next();
  };
}

// Ensure clinicians/staff operate within their assigned organization unless authorized cross-facility grant exists
export function requireOrgScope(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  // Super Admins have system-wide oversight
  if (req.user.role === Role.SUPER_ADMIN) {
    next();
    return;
  }

  if (!req.user.organizationId && req.user.role !== Role.PATIENT) {
    res.status(403).json({
      success: false,
      error: 'User is not associated with an authorized healthcare organization.',
    });
    return;
  }

  next();
};
