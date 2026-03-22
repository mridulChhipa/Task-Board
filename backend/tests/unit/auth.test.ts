import { before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert';

import { AuthService } from '../../src/services/auth.service';
import { generateAuthTokens } from '../../src/utils/jwt';
import { hash } from '../../src/utils/hash';
import { GlobalRole } from '../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import { PrismaClient } from '@prisma/client/extension';
import { projectService } from '../../src/services/project.service';

describe('AuthService', () => {
  let service: AuthService;
  const db: PrismaClient = prisma;

  before(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ISSUER = 'test-issuer';
  });

  beforeEach(() => {
    service = new AuthService();
  });

  test('register creates user and returns tokens', async () => {
    const body = {
      name: 'Test User',
      email: 'native@node.test',
      password: 'superSecretPassword1!',
    };

    let createdUserArgs: any = null;
    db.user = {
      findUnique: async () => null,
      create: async (args: any) => {
        createdUserArgs = args;
        return {
          id: 1,
          name: args.data.name,
          email: args.data.email,
          password: args.data.password,
        };
      },
    };

    let loginCalled = false;
    service.login = async () => {
      loginCalled = true;
      return { accessToken: 'access', refreshToken: 'refresh', userId: 1 };
    };

    const result = await service.register(body);

    assert.ok(loginCalled);
    assert.equal(result.userId, 1);
    assert.equal(createdUserArgs?.data.email, body.email);
    assert.equal(createdUserArgs?.data.name, body.name);
    assert.equal(createdUserArgs?.data.globalRole, GlobalRole.USER);
    assert.notEqual(createdUserArgs?.data.password, body.password);
  });

  test('register rejects existing user', async () => {
    db.user = {
      findUnique: async () => ({ id: 1 }),
    };

    await assert.rejects(
      () =>
        service.register({
          name: 'Test User',
          email: 'native@node.test',
          password: 'superSecretPassword1!',
        }),
      /User already exists/,
    );
  });

  test('register rejects create failure', async () => {
    db.user = {
      findUnique: async () => null,
      create: async () => {
        throw new Error('create failed');
      },
    };

    await assert.rejects(
      () =>
        service.register({
          name: 'Test User',
          email: 'native@node.test',
          password: 'superSecretPassword1!',
        }),
      /create failed/,
    );
  });

  test('login returns tokens and stores session', async () => {
    const password = 'superSecretPassword1!';
    const hashedPassword = await hash(password);

    let sessionArgs: any = null;
    db.user = {
      findUnique: async () => ({
        id: 1,
        name: 'Test User',
        email: 'native@node.test',
        password: hashedPassword,
        globalRole: 'USER',
        notifications: [],
        avatar: null,
        projects: [],
      }),
    };
    db.session = {
      create: async (args: any) => {
        sessionArgs = args;
        return {
          id: args.data.id,
          userId: args.data.userId,
          token: args.data.token,
          expiresAt: args.data.expiresAt,
        };
      },
    };

    const result = await service.login({
      email: 'native@node.test',
      password,
    });

    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
    assert.equal(result.userId, 1);
    assert.equal(sessionArgs?.data.userId, 1);
    assert.equal(sessionArgs?.data.token, result.refreshToken);
  });

  test('login rejects missing user', async () => {
    db.user = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () =>
        service.login({
          email: 'native@node.test',
          password: 'superSecretPassword1!',
        }),
      /User not found/,
    );
  });

  test('login rejects invalid credentials', async () => {
    const hashedPassword = await hash('correct-password');
    db.user = {
      findUnique: async () => ({
        id: 1,
        name: 'Test User',
        email: 'native@node.test',
        password: hashedPassword,
        globalRole: 'USER',
        notifications: [],
        avatar: null,
        projects: [],
      }),
    };

    await assert.rejects(
      () =>
        service.login({
          email: 'native@node.test',
          password: 'wrong-password',
        }),
      /Invalid credentials/,
    );
  });

  test('logout deletes session for refresh token', async () => {
    const sessionId = 'session-logout-1';
    const { refreshToken } = generateAuthTokens(
      1,
      'native@node.test',
      sessionId,
    );

    let deletedSessionId: string | null = null;
    db.session = {
      delete: async (args: any) => {
        deletedSessionId = args.where.id;
        return {
          id: args.where.id,
        };
      },
    };

    await service.logout(refreshToken);

    assert.equal(deletedSessionId, sessionId);
  });

  test('logout rejects delete failure', async () => {
    const sessionId = 'session-logout-2';
    const { refreshToken } = generateAuthTokens(
      1,
      'native@node.test',
      sessionId,
    );

    db.session = {
      delete: async () => {
        throw new Error('delete failed');
      },
    };

    await assert.rejects(() => service.logout(refreshToken), /delete failed/);
  });

  test('logout rejects non-refresh tokens', async () => {
    const tokens = generateAuthTokens(1, 'native@node.test', 'session-1');
    await assert.rejects(
      () => service.logout(tokens.accessToken),
      /Invalid or expired token/,
    );
  });

  test('refresh validates token and updates session', async () => {
    const sessionId = 'session-refresh-1';
    const tokens = generateAuthTokens(1, 'native@node.test', sessionId);

    let updatedToken: string | null = null;
    db.session = {
      findUnique: async () => ({
        id: sessionId,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        user: {
          id: 1,
          email: 'native@node.test',
        },
      }),
      update: async (args: any) => {
        updatedToken = args.data.token;
        return {
          id: args.where.id,
          token: args.data.token,
          expiresAt: new Date(),
        };
      },
    };

    const result = await service.refresh(tokens.refreshToken);

    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
    assert.equal(updatedToken, result.refreshToken);
  });

  test('refresh rejects non-refresh token', async () => {
    const tokens = generateAuthTokens(1, 'native@node.test', 'session-1');

    await assert.rejects(
      () => service.refresh(tokens.accessToken),
      /Invalid or expired token/,
    );
  });

  test('refresh rejects missing session', async () => {
    const sessionId = 'session-missing-1';
    const tokens = generateAuthTokens(1, 'native@node.test', sessionId);

    db.session = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () => service.refresh(tokens.refreshToken),
      /Invalid or expired refresh token/,
    );
  });

  test('refresh rejects token mismatch', async () => {
    const sessionId = 'session-mismatch-1';
    const tokens = generateAuthTokens(1, 'native@node.test', sessionId);

    db.session = {
      findUnique: async () => ({
        id: sessionId,
        token: 'different-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        user: {
          id: 1,
          email: 'native@node.test',
        },
      }),
    };

    await assert.rejects(
      () => service.refresh(tokens.refreshToken),
      /Invalid or expired refresh token/,
    );
  });

  test('refresh rejects expired session', async () => {
    const sessionId = 'session-expired-1';
    const tokens = generateAuthTokens(1, 'native@node.test', sessionId);

    db.session = {
      findUnique: async () => ({
        id: sessionId,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000),
        user: {
          id: 1,
          email: 'native@node.test',
        },
      }),
    };

    await assert.rejects(
      () => service.refresh(tokens.refreshToken),
      /Invalid or expired refresh token/,
    );
  });

  test('updateUser updates profile fields', async () => {
    let updateArgs: any = null;
    db.user = {
      findUnique: async () => ({
        id: 1,
        name: 'Test User',
        email: 'native@node.test',
        password: 'hashed',
        globalRole: 'USER',
        notifications: [],
        avatar: null,
        projects: [],
      }),
      update: async (args: any) => {
        updateArgs = args;
        return {
          id: 1,
          name: args.data.name,
          email: args.where.email,
          avatar: args.data.avatar,
          globalRole: args.data.globalRole,
        };
      },
    };

    await service.updateUser({
      userId: 1,
      name: 'Updated Name',
      email: 'native@node.test',
      avatar: null,
      globalRole: 'USER',
    });

    assert.equal(updateArgs?.data.name, 'Updated Name');
    assert.equal(updateArgs?.data.globalRole, GlobalRole.USER);
  });

  test('updateUser rejects missing user', async () => {
    db.user = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () =>
        service.updateUser({
          userId: 1,
          name: 'Updated Name',
          email: 'native@node.test',
          avatar: null,
          globalRole: 'USER',
        }),
      /User not found/,
    );
  });

  test('userDetails returns user payload', async () => {
    db.user = {
      findUnique: async () => ({
        id: 1,
        name: 'Test User',
        email: 'native@node.test',
        avatar: null,
        globalRole: 'USER',
        projects: [],
        notifications: [],
      }),
    };

    const result = await service.userDetails(1);

    assert.equal(result.personalData.userId, 1);
    assert.equal(result.personalData.email, 'native@node.test');
    assert.equal(result.personalData.globalRole, 'USER');
    assert.deepEqual(result.projectData, []);
    assert.deepEqual(result.notifications, []);
  });

  test('userDetails includes global admin projects', async () => {
    db.user = {
      findUnique: async () => ({
        id: 1,
        name: 'Admin',
        email: 'admin@node.test',
        avatar: null,
        globalRole: 'GLOBAL_ADMIN',
        projects: [
          {
            projectId: 'project-1',
            role: 'PROJECT_ADMIN',
          },
        ],
        notifications: [],
      }),
    };

    db.project = {
      findUnique: async () => ({
        id: 'project-1',
        name: 'Member Project',
        description: null,
        isArchived: false,
        members: [{ userId: 1 }],
      }),
    };

    projectService.fetchGlobalAdminProjects = (async () => [
      {
        id: 'project-2',
        name: 'Global Project',
        description: null,
        role: 'PROJECT_VIEWER' as any,
        members: [1],
        isArchived: false,
      },
    ]) as any;

    const result = await service.userDetails(1);

    assert.equal(result.projectData.length, 2);
  });

  test('userDetails rejects missing user', async () => {
    db.user = {
      findUnique: async () => null,
    };

    await assert.rejects(() => service.userDetails(1), /User not found/);
  });

  test('userDetails rejects missing project', async () => {
    db.user = {
      findUnique: async () => ({
        id: 1,
        name: 'Test User',
        email: 'native@node.test',
        avatar: null,
        globalRole: 'USER',
        projects: [
          {
            projectId: 'project-missing',
            role: 'PROJECT_MEMBER',
          },
        ],
        notifications: [],
      }),
    };

    db.project = {
      findUnique: async () => null,
    };

    await assert.rejects(() => service.userDetails(1), /Project not found/);
  });

  test('userDetailsByMail returns user payload', async () => {
    db.user = {
      findUnique: async () => ({
        id: 2,
        name: 'Mail User',
        email: 'mail@node.test',
        avatar: null,
        globalRole: 'USER',
        projects: [],
        notifications: [],
      }),
    };

    const result = await service.userDetailsByMail('mail@node.test');

    assert.equal(result.personalData.userId, 2);
    assert.equal(result.personalData.email, 'mail@node.test');
  });

  test('userDetailsByMail rejects missing user', async () => {
    db.user = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () => service.userDetailsByMail('missing@node.test'),
      /User not found/,
    );
  });
});
