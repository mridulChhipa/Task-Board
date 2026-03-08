import { randomUUID } from 'node:crypto';

import { db } from '../config/db';
import { compare, hash } from '../utils/hash';

import { TokenType } from '../types/auth.types';
import type {
  LoginBody,
  AuthToken,
  RegisterBody,
  UserWithProjs,
} from '../types/auth.types';

import { generateAuthTokens, verifyToken } from '../utils/jwt';
import { GlobalRole } from '../../generated/prisma/enums';
import type { ProjectDetails, ProjectRole } from '../types/project.types';

export class AuthService {
  async register(body: RegisterBody): Promise<AuthToken> {
    try {
      const existingUser = await db.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await hash(body.password);

      await db.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
          globalRole: GlobalRole.USER,
        },
      });

      return await this.login({
        email: body.email,
        password: body.password,
      });
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  async login(body: LoginBody): Promise<AuthToken> {
    try {
      const user = await db.user.findUnique({
        where: {
          email: body.email,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await compare(body.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const sessionId = randomUUID();
      const tokens = generateAuthTokens(user.id, user.email, sessionId);

      await db.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      tokens.userId = user.id;
      return tokens;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET ?? '',
      );
      if (payload.type !== TokenType.REFRESH) {
        throw new Error('Invalid token type');
      }

      await db.session.delete({
        where: {
          id: payload.jti,
        },
      });
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  }

  async refresh(refreshToken: string): Promise<AuthToken> {
    try {
      console.log("================ \n Refresh Token from service for refresh: ", refreshToken, "\n===============");

      const payload = verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET ?? '',
      );

      console.log("Token \n Verified, ", TokenType.REFRESH, payload.type);
      if (payload.type !== TokenType.REFRESH) {
        throw new Error('Invalid token type');
      }

      console.log("Payload \n Type \nVerified");

      const session = await db.session.findUnique({
        where: {
          id: payload.jti,
        },
        include: {
          user: true,
        },
      });

      console.log("=======================\nPayload Verified\n", session, refreshToken, "\n=================");

      if (
        !session ||
        session.expiresAt < new Date() ||
        session.token !== refreshToken
      ) {
        throw new Error('Invalid or expired refresh token');
      }

      const tokens = generateAuthTokens(
        session.user.id,
        session.user.email,
        session.id,
      );

      await db.session.update({
        where: {
          id: session.id,
        },
        data: {
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return tokens;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  async userDetails(userId: number): Promise<UserWithProjs> {
    try {
      console.log("================ \n UserId: ", userId, " \n ==================");
      const rawUserData = await db.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          projects: true,
        },
      });

      if (!rawUserData) {
        throw new Error('User not found');
      }

      const allProjs: ProjectDetails[] = [];

      for (const membership of rawUserData.projects) {
        const currProj = await db.project.findUnique({
          where: {
            id: membership.projectId,
          },
          include: {
            members: true,
          },
        });

        if (!currProj) {
          throw new Error('');
        }

        const allMembers: number[] = [];
        for (const member of currProj.members) {
          allMembers.push(member.userId);
        }

        allProjs.push({
          id: currProj.id,
          name: currProj.name,
          description: currProj.description ?? '',
          role: membership.role as ProjectRole,
          members: allMembers,
        });
      }

      const userData: UserWithProjs = {
        personalData: {
          name: rawUserData.name,
          email: rawUserData.email,
          avatar: rawUserData.avatar,
          globalRole: rawUserData.globalRole,
        },
        projectData: allProjs,
      };

      return userData;
    } catch (error) {
      console.log('User Details Catch: ', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
