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
      const { accessToken, refreshToken, userId } =
        await authService.register(body);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.MODE === 'PRODUCTION',
        sameSite: process.env.MODE === 'PRODUCTION' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: 'User registered successfully',
        accessToken,
        userId,
      });

      next();
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: LoginBody = req.body;
      const { accessToken, refreshToken, userId } =
        await authService.login(body);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.MODE === 'PRODUCTION',
        sameSite: process.env.MODE === 'PRODUCTION' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'User Login successful',
        accessToken,
        userId,
      });

      next();
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
      const oldRefreshToken = req.cookies.refreshToken
      if (!oldRefreshToken) {
        res.status(401).json({ error: 'No refresh token' });
      }

      // console.log("Old Refresh Token", oldRefreshToken);
      
      const { accessToken, refreshToken, userId } =
        await authService.refresh(oldRefreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.MODE === 'PRODUCTION',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Token Refresh Successfull',
        accessToken,
        userId,
      });

      next();
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

      next();
    } catch (error) {
      next(error);
    }
  }

  async fetchUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = Number(req.params.userId);

      const fetchedUser = await authService.userDetails(userId);
      res.status(200).json({
        status: 'success',
        data: fetchedUser,
      });

      next();
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
