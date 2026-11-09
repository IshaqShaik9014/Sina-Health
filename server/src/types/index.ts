import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  organizationId?: string | null;
  firstName: string;
  lastName: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
