import { randomUUID } from 'node:crypto';

import { db } from '../config/db';
import { compare, hash } from '../utils/hash';

import { TokenType } from '../types/auth.types';
import type {
  LoginBody,
  AuthToken,
  RegisterBody,
  UserWithProjs,
  UserDetails,
} from '../types/auth.types';

import { generateAuthTokens, verifyToken } from '../utils/jwt';
import { GlobalRole } from '../../generated/prisma/enums';
import { ProjectDetails, ProjectRole } from '../types/project.types';
import { projectService } from './project.service';
import { wsServer } from '../index';

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
      throw new Error('Error registering user:', { cause: error });
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
      throw new Error('Error logging in user:', { cause: error });
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

      wsServer.removeUser(payload.sub);
    } catch (error) {
      throw new Error('Error Logging out user: ', { cause: error });
    }
  }

  async refresh(refreshToken: string): Promise<AuthToken> {
    try {
      const payload = verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET ?? '',
      );

      if (payload.type !== TokenType.REFRESH) {
        throw new Error('Invalid token type');
      }
      const session = await db.session.findUnique({
        where: {
          id: payload.jti,
        },
        include: {
          user: true,
        },
      });

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
      throw new Error('Error refreshing token:', { cause: error });
    }
  }

  async userDetails(userId: number): Promise<UserWithProjs> {
    try {
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
          throw new Error('Project not found');
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
          isArchived: currProj.isArchived,
        });
      }

      if (rawUserData.globalRole === 'GLOBAL_ADMIN') {
        const globalProjects = await projectService.fetchGlobalAdminProjects();
        for (const currProj of globalProjects) {
          allProjs.push({
            id: currProj.id,
            name: currProj.name,
            description: currProj.description ?? '',
            role: ProjectRole.PROJECT_ADMIN,
            members: currProj.members,
            isArchived: currProj.isArchived,
          });
        }
      }

      const userData: UserWithProjs = {
        personalData: {
          userId: rawUserData.id,
          name: rawUserData.name,
          email: rawUserData.email,
          avatar: rawUserData.avatar,
          globalRole: rawUserData.globalRole,
        },
        projectData: allProjs,
      };

      return userData;
    } catch (error) {
      throw new Error('User Details Catch: ', { cause: error });
    }
  }

  async userDetailsByMail(userMail: string): Promise<UserWithProjs> {
    try {
      const rawUserData = await db.user.findUnique({
        where: {
          email: userMail,
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
          throw new Error('Project not found');
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
          isArchived: currProj.isArchived,
        });
      }

      const userData: UserWithProjs = {
        personalData: {
          userId: rawUserData.id,
          email: rawUserData.email,
          name: rawUserData.name,
          avatar: rawUserData.avatar,
          globalRole: rawUserData.globalRole,
        },
        projectData: allProjs,
      };

      return userData;
    } catch (error) {
      throw new Error('User Details Catch: ', { cause: error });
    }
  }

  async updateUser(body: UserDetails): Promise<void> {
    try {
      const user = await db.user.findUnique({
        where: {
          email: body.email,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      await db.user.update({
        where: {
          email: body.email,
        },
        data: {
          name: body.name,
          avatar: body.avatar,
        },
      });
    } catch (error) {
      throw new Error('Error updating user:', { cause: error });
    }
  }
}

export const authService = new AuthService();
