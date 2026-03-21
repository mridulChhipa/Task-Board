import * as http from 'node:http';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert';

import { app } from '../src/app';
import { generateAuthTokens } from '../src/utils/jwt';
import { prisma } from '../lib/prisma';
import type { PrismaClient } from '@prisma/client/extension';
import { ProjectRole } from '../src/types/project.types';
import type { ProjectCreateArgs, ProjectMemberCreateArgs, ProjectMemberDeleteArgs, ProjectMemberFindUniqueArgs, ProjectMemberUpdateArgs, ProjectUpdateArgs, UserFindUniqueArgs } from '../generated/prisma/models';

describe('Project API Endpoints (RBAC)', () => {
  let server: http.Server;
  let baseUrl: string;

  const db: PrismaClient = prisma;

  let currentUser: {
    id: number;
    email: string;
    globalRole: string;
  } | null = null;

  let targetUser: {
    id: number;
    email: string;
  } | null = null;

  let membershipRole: ProjectRole | null = null;
  let targetMembershipRole: ProjectRole | null = null;

  const projectId = 'project-1';
  const userId = 1;
  const userEmail = 'admin@node.test';

  const authCookieFor = (email = userEmail, id = userId): string => {
    const { refreshToken } = generateAuthTokens(id, email, `session-${Date.now()}`);
    return `refreshToken=${refreshToken}`;
  };

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

    db.user = {
      findUnique: async (args: UserFindUniqueArgs) => {
        if (!currentUser) {
          return null;
        }

        if (args.where?.email) {
          if (args.where.email === currentUser.email) {
            return {
              id: currentUser.id,
              name: 'Project User',
              email: currentUser.email,
              globalRole: currentUser.globalRole,
              notifications: [],
              avatar: null,
              projects: [],
            };
          }

          if (targetUser && args.where.email === targetUser.email) {
            return {
              id: targetUser.id,
              name: 'Target User',
              email: targetUser.email,
              globalRole: 'USER',
              notifications: [],
              avatar: null,
              projects: [],
            };
          }

          return null;
        }

        return {
          id: currentUser.id,
          name: 'Project User',
          email: currentUser.email,
          globalRole: currentUser.globalRole,
          notifications: [],
          avatar: null,
          projects: [],
        };
      },
    };

    db.projectMember = {
      findUnique: async (args: ProjectMemberFindUniqueArgs) => {
        const memberId = args.where.uniqueUser?.userId;
        if (memberId === userId) {
          if (!membershipRole) {
            return null;
          }

          return {
            projectId,
            userId,
            role: membershipRole,
          };
        }

        if (targetUser && memberId === targetUser.id) {
          if (!targetMembershipRole) {
            return null;
          }

          return {
            projectId,
            userId: targetUser.id,
            role: targetMembershipRole,
          };
        }

        return null;
      },
      create: async (args: ProjectMemberCreateArgs) => ({
        projectId: args.data.projectId,
        userId: args.data.userId,
        role: args.data.role,
      }),
      delete: async (args: ProjectMemberDeleteArgs) => ({
        projectId: args.where.uniqueUser?.projectId,
        userId: args.where.uniqueUser?.userId,
        role: ProjectRole.PROJECT_MEMBER,
      }),
      update: async (args: ProjectMemberUpdateArgs) => ({
        projectId: args.where.uniqueUser?.projectId,
        userId: args.where.uniqueUser?.userId,
        role: args.data.role,
      }),
    };

    db.project = {
      create: async (args: ProjectCreateArgs) => ({
        id: projectId,
        name: args.data.name,
        description: args.data.description ?? null,
        isArchived: false,
      }),
      update: async (args: ProjectUpdateArgs) => ({
        id: projectId,
        name: args.data.name ?? 'Updated Project',
        description: args.data.description ?? null,
        isArchived: args.data.isArchived ?? false,
        members: [{ userId }],
      }),
      findUnique: async () => ({
        id: projectId,
        name: 'Sample Project',
        description: 'RBAC Sample',
        isArchived: false,
        members: [{ userId }],
        boards: [],
      }),
      delete: async () => ({
        id: projectId,
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

  test('POST /api/project/create should allow global admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'GLOBAL_ADMIN',
    };
    membershipRole = null;

    const response = await fetch(`${baseUrl}/api/project/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        name: 'New Project',
        description: 'RBAC create test',
      }),
    });

    assert.equal(response.status, 201);
    const data = (await response.json()) as { message: string; data: { id: string } };
    assert.equal(data.message, 'Project Creation Successful');
    assert.equal(data.data.id, projectId);
  });

  test('POST /api/project/create should reject non-global admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(`${baseUrl}/api/project/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        name: 'Blocked Project',
        description: 'RBAC create fail',
      }),
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Global Admin priviledges required');
  });

  test('GET /api/project/:projectId should allow project member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${baseUrl}/api/project/${projectId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as { status: string; data: { id: string } };
    assert.equal(data.status, 'Success');
    assert.equal(data.data.id, projectId);
  });

  test('GET /api/project/:projectId should reject non-member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(`${baseUrl}/api/project/${projectId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Not a global user');
  });

  test('PATCH /api/project/update/:projectId should allow project admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_ADMIN;

    const response = await fetch(`${baseUrl}/api/project/update/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        name: 'Updated Project',
        description: 'Updated',
        isArchived: false,
      }),
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as { message: string; data: { id: string } };
    assert.equal(data.message, 'Project updation Successful');
    assert.equal(data.data.id, projectId);
  });

  test('PATCH /api/project/update/:projectId should reject non-admin member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${baseUrl}/api/project/update/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        name: 'Blocked Update',
        description: 'Denied',
        isArchived: false,
      }),
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('PATCH /api/project/set-archive-status/:projectId should allow project admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_ADMIN;

    const response = await fetch(
      `${baseUrl}/api/project/set-archive-status/${projectId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          isArchived: true,
        }),
      },
    );

    assert.equal(response.status, 200);
    const data = (await response.json()) as { message: string };
    assert.equal(data.message, 'Updated archive status');
  });

  test('PATCH /api/project/set-archive-status/:projectId should reject non-admin member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(
      `${baseUrl}/api/project/set-archive-status/${projectId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          isArchived: true,
        }),
      },
    );

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('POST /api/project/assign-user/:projectId should allow project admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    targetUser = {
      id: 2,
      email: 'member@node.test',
    };
    membershipRole = ProjectRole.PROJECT_ADMIN;
    targetMembershipRole = null;

    const response = await fetch(
      `${baseUrl}/api/project/assign-user/${projectId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          userMail: targetUser.email,
          role: ProjectRole.PROJECT_MEMBER,
        }),
      },
    );

    assert.equal(response.status, 200);
    const data = (await response.json()) as { message: string };
    assert.equal(data.message, 'Assigned user');
  });

  test('POST /api/project/assign-user/:projectId should reject non-admin member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    targetUser = {
      id: 2,
      email: 'member@node.test',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;
    targetMembershipRole = null;

    const response = await fetch(
      `${baseUrl}/api/project/assign-user/${projectId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          userMail: targetUser.email,
          role: ProjectRole.PROJECT_MEMBER,
        }),
      },
    );

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('POST /api/project/remove-user/:projectId should allow project admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    targetUser = {
      id: 2,
      email: 'member@node.test',
    };
    membershipRole = ProjectRole.PROJECT_ADMIN;
    targetMembershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(
      `${baseUrl}/api/project/remove-user/${projectId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          userMail: targetUser.email,
        }),
      },
    );

    assert.equal(response.status, 200);
    const data = (await response.json()) as { message: string };
    assert.equal(data.message, 'Removed user');
  });

  test('POST /api/project/remove-user/:projectId should reject non-admin member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    targetUser = {
      id: 2,
      email: 'member@node.test',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;
    targetMembershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(
      `${baseUrl}/api/project/remove-user/${projectId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          userMail: targetUser.email,
        }),
      },
    );

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('PATCH /api/project/update-role/:projectId should allow project admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    targetUser = {
      id: 2,
      email: 'member@node.test',
    };
    membershipRole = ProjectRole.PROJECT_ADMIN;
    targetMembershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(
      `${baseUrl}/api/project/update-role/${projectId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          userMail: targetUser.email,
          role: ProjectRole.PROJECT_VIEWER,
        }),
      },
    );

    assert.equal(response.status, 200);
    const data = (await response.json()) as { message: string };
    assert.equal(data.message, 'Updated the role');
  });

  test('PATCH /api/project/update-role/:projectId should reject non-admin member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    targetUser = {
      id: 2,
      email: 'member@node.test',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;
    targetMembershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(
      `${baseUrl}/api/project/update-role/${projectId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          userMail: targetUser.email,
          role: ProjectRole.PROJECT_VIEWER,
        }),
      },
    );

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('DELETE /api/project/:projectId should allow project admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_ADMIN;

    const response = await fetch(`${baseUrl}/api/project/${projectId}`, {
      method: 'DELETE',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 204);
  });

  test('DELETE /api/project/:projectId should reject non-admin member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${baseUrl}/api/project/${projectId}`, {
      method: 'DELETE',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 500);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });
});
