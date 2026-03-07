import type { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { parse } from 'url';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET as string;

export interface AuthenticatedRequest extends IncomingMessage {
  userId?: string;
}

export function authenticateWSRequest(req: AuthenticatedRequest): {
  valid: boolean;
  userId?: string;
} {
  try {
    const authHeader = req.headers['authorization'];
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      const { query } = parse(req.url ?? '', true);
      token = query.token as string | undefined;
    }

    if (!token) {
      return { valid: false };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    if (!decoded.userId) {
      return { valid: false };
    }

    return { valid: true, userId: decoded.userId };
  } catch {
    return { valid: false };
  }
}
