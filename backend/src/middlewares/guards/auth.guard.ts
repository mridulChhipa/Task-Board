import type { NextFunction, Request, Response } from 'express';
import { TokenType } from '../../types/auth.types';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { verifyToken } from '../../utils/jwt';

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new Error('Authentocation Required');
    }

    const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET ?? '');
    if (payload.type !== TokenType.ACCESS) {
      throw new Error('Invalid Token Type');
    }

    const authReq = req as unknown as AuthenticatedRequest;
    authReq.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}
