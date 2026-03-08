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
    // const authHeader = req.headers.authorization;

    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   throw new Error('Authentication required - no token');
    // }

    // const token = authHeader.split(' ')[1];
    const token = req.cookies.refreshToken

    if (!token) {
      throw new Error('Authentication required - invalid format');
    }

    console.log("============\n Refresh Token from guard: ", token, "\n=================");

    const payload = verifyToken(token, process.env.JWT_REFRESH_SECRET ?? '');
    if (payload.type !== TokenType.REFRESH) {
      throw new Error('Invalid Token Type');
    }

    const authReq = req as AuthenticatedRequest;
    authReq.user = payload;
    console.log(payload);
    next();
  } catch (err) {
    next(err);
  }
}
