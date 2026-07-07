import type { NextFunction, Request, Response } from 'express';
import { TokenType } from '../../types/auth.types';
import type { AuthenticatedRequest } from '../../types/auth.types';
import { verifyToken } from '../../utils/jwt';
import { requireEnv } from '../../config/env';
import { db } from '../../config/db';
import { UnauthorizedError } from '../../errors';

export async function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new UnauthorizedError('Authentication required - invalid format');
    }

    const payload = verifyToken(token, requireEnv('JWT_REFRESH_SECRET'));
    if (payload.type !== TokenType.REFRESH) {
      throw new UnauthorizedError('Invalid Token Type');
    }

    // A signature check alone is not enough: logout deletes the session row,
    // and tokens from revoked or expired sessions must stop working.
    const session = await db.session.findUnique({
      where: { id: payload.jti },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    const authReq = req as AuthenticatedRequest;
    authReq.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}
