import 'dotenv/config';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

import { TokenType } from '../types/auth.types';
import type { AuthToken, JWTPayload } from '../types/auth.types';

interface SignParams {
  userId: number;
  email: string;
  role: string;
  type: TokenType;
  jti: string;
  secret: string;
  expiresIn: number;
}

const signToken = (params: SignParams): string => {
  const payload: JWTPayload = {
    sub: params.userId,
    email: params.email,
    iss: process.env.JWT_ISSUER ?? '',
    jti: params.jti,
    type: params.type,
    role: params.role,
  };

  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn: params.expiresIn,
  };

  return jwt.sign(payload, params.secret, options);
};

const verifyToken = (token: string, secret: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    });

    if (typeof decoded === 'string') {
      throw new Error('Invalid token payload');
    }

    return decoded as unknown as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const generateAuthTokens = (
  userId: number,
  email: string,
  role: string,
  jti: string,
): AuthToken => {
  const accessToken = signToken({
    userId,
    email,
    role,
    type: TokenType.ACCESS,
    jti,
    secret: process.env.JWT_ACCESS_SECRET ?? '',
    expiresIn: 15 * 60,
  });

  const refreshToken = signToken({
    userId,
    email,
    role,
    type: TokenType.REFRESH,
    jti,
    secret: process.env.JWT_REFRESH_SECRET ?? '',
    expiresIn: 7 * 24 * 60 * 60,
  });

  return { accessToken, refreshToken };
};

export { signToken, verifyToken, generateAuthTokens };
