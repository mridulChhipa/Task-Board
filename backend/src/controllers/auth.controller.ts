import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import type { LoginBody, RegisterBody } from '../types/auth.types';

export class AuthController {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body: RegisterBody = req.body;
      const { accessToken, refreshToken } = await authService.register(body);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.MODE === 'PRODUCTION',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.status(201).json({
        message: 'User registered successfully',
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: LoginBody = req.body;
      const { accessToken, refreshToken } = await authService.login(body);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.MODE === 'PRODUCTION',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json({
        message: 'User Login successful',
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { refreshToken: oldRefreshToken } = req.body;
      const { accessToken, refreshToken } =
        await authService.refresh(oldRefreshToken);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.MODE === 'PRODUCTION',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Token Refresh Successfull',
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.clearCookie('accessToken');
      res.status(200).json({
        message: 'User Logout Successfull',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
