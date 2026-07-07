import { randomUUID } from 'node:crypto';

import { db } from '../config/db';
import { compare, hash } from '../utils/hash';

import { TokenType } from '../types/auth.types';
import type {
  LoginBody,
  AuthToken,
  RegisterBody,
  UserDetails,
  CompleteUser,
} from '../types/auth.types';

import { generateAuthTokens, verifyToken } from '../utils/jwt';
import { GlobalRole } from '../../generated/prisma/enums';
import type { Prisma } from '../../generated/prisma/client';
import { type ProjectDetails, ProjectRole } from '../types/project.types';
import { projectService } from './project.service';
import type { NotifType } from '../types/notifcation.types';
import { getWSServer } from '../websocket/ws';
import { requireEnv } from '../config/env';

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
      void error;
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
      void error;
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = verifyToken(
        refreshToken,
        requireEnv('JWT_REFRESH_SECRET'),
      );
      if (payload.type !== TokenType.REFRESH) {
        throw new Error('Invalid token type');
      }

      await db.session.delete({
        where: {
          id: payload.jti,
        },
      });

      getWSServer()?.removeUser(payload.sub);
    } catch (error) {
      void error;
      throw error;
    }
  }

  async refresh(refreshToken: string): Promise<AuthToken> {
    try {
      const payload = verifyToken(
        refreshToken,
        requireEnv('JWT_REFRESH_SECRET'),
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
      void error;
      throw error;
    }
  }

  /** Lightweight payload for GET /me: role and raw notifications. */
  async sessionUserSummary(email: string) {
    return db.user.findUnique({
      where: { email },
      select: { globalRole: true, notifications: true },
    });
  }

  async userDetails(userId: number): Promise<CompleteUser> {
    return this.buildUserDetails({ id: userId }, true);
  }

  async userDetailsByMail(userMail: string): Promise<CompleteUser> {
    return this.buildUserDetails({ email: userMail }, false);
  }

  /**
   * Fetch the user with memberships, their projects (and member lists) and
   * notifications in a single nested query instead of one query per project.
   */
  private async buildUserDetails(
    where: Prisma.UserWhereUniqueInput,
    includeGlobalProjects: boolean,
  ): Promise<CompleteUser> {
    const rawUserData = await db.user.findUnique({
      where,
      include: {
        projects: {
          include: {
            project: {
              include: {
                members: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
        notifications: {
          include: {
            recipient: true,
            sender: true,
          },
        },
      },
    });

    if (!rawUserData) {
      throw new Error('User not found');
    }

    const allProjs: ProjectDetails[] = [];
    const projectMap = new Map<string, string>();

    for (const membership of rawUserData.projects) {
      const currProj = membership.project;
      if (!currProj) {
        throw new Error('Project not found');
      }

      allProjs.push({
        id: currProj.id,
        name: currProj.name,
        description: currProj.description ?? '',
        role: membership.role as ProjectRole,
        members: currProj.members.map((member) => member.userId),
        isArchived: currProj.isArchived,
      });
      projectMap.set(currProj.id, membership.role);
    }

    if (includeGlobalProjects && rawUserData.globalRole === 'GLOBAL_ADMIN') {
      const globalProjects = await projectService.fetchGlobalAdminProjects();
      for (const currProj of globalProjects) {
        if (projectMap.has(currProj.id)) {
          continue;
        }
        allProjs.push({
          id: currProj.id,
          name: currProj.name,
          description: currProj.description ?? '',
          role: ProjectRole.PROJECT_VIEWER,
          members: currProj.members,
          isArchived: currProj.isArchived,
        });
      }
    }

    return {
      personalData: {
        userId: rawUserData.id,
        name: rawUserData.name,
        email: rawUserData.email,
        avatar: rawUserData.avatar,
        globalRole: rawUserData.globalRole,
      },
      projectData: allProjs,
      notifications: rawUserData.notifications.map((notif) => ({
        id: notif.id,
        recipientId: notif.recipientId,
        senderId: notif.senderId,
        taskId: notif.taskId,
        commentId: notif.commentId,
        threadId: notif.threadId,
        type: notif.type as NotifType,
        recipientName: notif.recipient.name,
        senderName: notif.sender.name,
        read: notif.read,
      })),
    };
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
          globalRole: body.globalRole as GlobalRole,
        },
      });
    } catch (error) {
      void error;
      throw error;
    }
  }
}

export const authService = new AuthService();
