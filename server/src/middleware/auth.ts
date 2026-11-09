import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthenticatedUser } from '../types';
import { ENV } from '../config/env';
import prisma from '../config/prisma';
import { isMockMode, mockStore } from '../utils/mockStore';

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // Check Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.sina_session) {
      token = req.cookies.sina_session;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. No session token provided.',
      });
      return;
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;

    let user: any;
    if (isMockMode) {
      user = mockStore.users.find(u => u.id === decoded.id);
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          organizationId: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });
    }

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'User account is inactive or not found.',
      });
      return;
    }

    req.user = {
      ...user,
      patientId: decoded.patientId,
      sinaId: decoded.sinaId,
    } as AuthenticatedUser;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session token.',
    });
  }
}
