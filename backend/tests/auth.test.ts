import * as http from 'node:http';
import { after, before, describe, test } from 'node:test';

import type { AuthToken } from '../src/types/auth.types';
import { hash } from '../src/utils/hash';
import assert from 'node:assert';
import { app } from '../src/app';
import { generateAuthTokens } from '../src/utils/jwt';

import { prisma } from '../lib/prisma';
import type { Prisma } from '../generated/prisma/client';
import type { PrismaClient } from '@prisma/client/extension';

describe('Auth API Endpoints', () => {
  let server: http.Server;
  let baseUrl: string;
  let refreshSessionId: string | null = null;
  let refreshTokenValue: string | null = null;

  const db: PrismaClient = prisma;

  before(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ISSUER = 'test-issuer';

    server = http.createServer(app);

    await new Promise<void>((resolve, reject) => {
      server.listen(0, () => {
        const address = server.address();
        const port = typeof address === 'object' && address ? address.port : 80;
        baseUrl = `http://localhost:${port}`;
        console.log(`Test server running at ${baseUrl}`);
        resolve();
      });
      server.on('error', reject);
    });

    const hashedPassword = await hash('superSecretPassword1!');
    let findUniqueCallCount = 0;
    db.user = {
      findUnique: async (args: Prisma.UserFindUniqueArgs) => {
        findUniqueCallCount += 1;
        if (findUniqueCallCount === 1) {
          return null;
        }

        return {
          id: 1,
          name: args.where.email ? 'Test Native' : 'Test Native',
          email: args.where.email ?? 'native@node.test',
          password: hashedPassword,
          globalRole: 'USER',
          notifications: [],
          avatar: null,
          projects: [],
        };
      },
      create: async (args: Prisma.UserCreateArgs) => ({
        id: 1,
        name: args.data.name,
        email: args.data.email,
        password: args.data.password,
      }),
      update: async (args: Prisma.UserUpdateArgs) => ({
        id: 1,
        name: args.data.name,
        email: args.where.email,
        avatar: args.data.avatar,
        globalRole: args.data.globalRole,
      }),
    };

    db.session = {
      create: async (args: Prisma.SessionCreateArgs) => ({
        id: args.data.id,
        userId: args.data.userId,
        token: args.data.token,
        expiresAt: args.data.expiresAt,
      }),
      delete: async (args: Prisma.SessionDeleteArgs) => ({
        id: args.where.id,
      }),
      findUnique: async (args: Prisma.SessionFindUniqueArgs) => {
        if (!refreshSessionId || !refreshTokenValue) {
          return null;
        }

        return {
          id: args.where.id ?? refreshSessionId,
          token: refreshTokenValue,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          user: {
            id: 1,
            email: 'native@node.test',
          },
        };
      },
      update: async (args: Prisma.SessionUpdateArgs) => ({
        id: args.where.id,
        token: args.data.token,
        expiresAt: args.data.expiresAt,
      }),
    };
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  test('POST /api/auth/register should return 201 on success', async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Native',
        email: 'native@node.test',
        password: 'superSecretPassword1!',
      }),
    });

    assert.equal(response.status, 201);
    const data = (await response.json()) as AuthToken;

    assert.ok(data.accessToken, 'Response should contain an access token');
    assert.equal(data.userId, 1);
    assert.ok(
      response.headers.get('set-cookie')?.includes('refreshToken='),
      'Response should set refresh token cookie',
    );
  });

  test('POST /api/auth/login should return 200 on valid credentials', async () => {
    // Provide the dummy hashed-password and user
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'native@node.test',
        password: 'superSecretPassword1!',
      }),
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as AuthToken;
    assert.ok(data.accessToken, 'Response should contain an access token');
    assert.equal(data.userId, 1);
    assert.ok(
      response.headers.get('set-cookie')?.includes('refreshToken='),
      'Response should set refresh token cookie',
    );
  });

  test('POST /api/auth/logout should return 200 on success', async () => {
    const sessionId = 'session-logout-1';
    const { refreshToken } = generateAuthTokens(
      1,
      'native@node.test',
      sessionId,
    );

    const response = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as { message: string };
    assert.equal(data.message, 'User Logout Successfull');
  });

  test('PATCH /api/auth/refresh should return 200 and new tokens', async () => {
    const sessionId = 'session-refresh-1';
    const { refreshToken } = generateAuthTokens(
      1,
      'native@node.test',
      sessionId,
    );

    refreshSessionId = sessionId;
    refreshTokenValue = refreshToken;

    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'PATCH',
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as AuthToken;
    assert.ok(data.accessToken, 'Response should contain an access token');
    assert.equal(data.userId, 1);
    assert.ok(
      response.headers.get('set-cookie')?.includes('refreshToken='),
      'Response should set refresh token cookie',
    );
  });

  test('GET /api/auth/me should return current user info', async () => {
    const sessionId = 'session-me-1';
    const { refreshToken } = generateAuthTokens(
      1,
      'native@node.test',
      sessionId,
    );

    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      email: string;
      role: string | null;
      notifications: unknown[];
    };
    assert.equal(data.email, 'native@node.test');
    assert.equal(data.role, 'USER');
    assert.deepEqual(data.notifications, []);
  });

  test('GET /api/auth/:userId should return user details', async () => {
    const sessionId = 'session-user-1';
    const { refreshToken } = generateAuthTokens(
      1,
      'native@node.test',
      sessionId,
    );

    const response = await fetch(`${baseUrl}/api/auth/1`, {
      method: 'GET',
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      status: string;
      data: { personalData: { userId: number } };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.data.personalData.userId, 1);
  });

  test('PATCH /api/auth/update-user should return 200 on success', async () => {
    const sessionId = 'session-update-1';
    const { refreshToken } = generateAuthTokens(
      1,
      'native@node.test',
      sessionId,
    );

    const response = await fetch(`${baseUrl}/api/auth/update-user`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
      body: JSON.stringify({
        userId: 1,
        name: 'Updated Name',
        email: 'native@node.test',
        avatar: null,
        globalRole: 'USER',
      }),
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as { status: string };
    assert.equal(data.status, 'success');
  });
});
