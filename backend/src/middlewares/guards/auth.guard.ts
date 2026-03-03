import type { NextFunction, Request, Response } from 'express';
import { JWTPayload, TokenType } from '../../types/auth.types';
import { verifyToken } from '../../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

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

    req.user = payload;
  } catch (err) {
    next(err);
  }
}
