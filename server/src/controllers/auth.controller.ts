import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { LoginSchema } from '../validators';
import { AuthRequest } from '../types';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = LoginSchema.parse(req.body);
      const result = await authService.login(email, password);

      // Set secure cookie for session
      res.cookie('sina_session', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('sina_session');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }
      const user = await authService.getCurrentUser(req.user.id);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const authController = new AuthController();
