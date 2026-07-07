import type { Request, Response, NextFunction, CookieOptions } from 'express';
import { authService } from '../services/auth.service';
import type {
  AuthenticatedRequest,
  LoginBody,
  RegisterBody,
  UserDetails,
} from '../types/auth.types';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.MODE === 'PRODUCTION',
  sameSite: process.env.MODE === 'PRODUCTION' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

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

      res.cookie('refreshToken', refreshToken, refreshCookieOptions);

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

      res.cookie('refreshToken', refreshToken, refreshCookieOptions);

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
      const oldRefreshToken = req.cookies.refreshToken;
      if (!oldRefreshToken) {
        res.status(401).json({ error: 'No refresh token' });
        return;
      }

      const { accessToken, refreshToken, userId } =
        await authService.refresh(oldRefreshToken);

      res.cookie('refreshToken', refreshToken, refreshCookieOptions);

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
      const refreshToken = req.cookies.refreshToken;
      await authService.logout(refreshToken);

      res.clearCookie('refreshToken');
      res.status(200).json({
        message: 'User Logout Successfull',
      });

      next();
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await authService.sessionUserSummary(authReq.user.email);

      res.status(200).json({
        ...authReq.user,
        role: user?.globalRole ?? null,
        notifications: user?.notifications ?? [],
      });
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

  async fetchUserByMail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userMail = req.params.userMail;

      if (typeof userMail !== 'string') {
        throw new Error('Invalid type for userMail');
      }

      const fetchedUser = await authService.userDetailsByMail(userMail);
      res.status(200).json({
        status: 'success',
        data: fetchedUser,
      });

      next();
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body: UserDetails = req.body;
      await authService.updateUser(body);
      res.status(200).json({
        status: 'success',
      });

      next();
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
