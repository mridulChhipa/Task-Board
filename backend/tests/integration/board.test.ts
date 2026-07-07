import * as http from 'node:http';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert';

import { app } from '../../src/app';
import { generateAuthTokens } from '../../src/utils/jwt';
import { db } from '../helpers';
import { ProjectRole } from '../../src/types/project.types';
import type {
  BoardCreateArgs,
  BoardDeleteArgs,
  BoardFindUniqueArgs,
  BoardUpdateArgs,
  EdgeConstraintCreateArgs,
  EdgeConstraintDeleteArgs,
  ProjectMemberFindUniqueArgs,
  UserFindUniqueArgs,
  WorkflowCreateArgs,
  WorkflowDeleteArgs,
  WorkflowFindFirstArgs,
  WorkflowUpdateArgs,
} from '../../generated/prisma/models';

describe('Board API Endpoints (RBAC)', () => {
  let server: http.Server;
  let baseUrl: string;

  let currentUser: {
    id: number;
    email: string;
    globalRole: string;
  } | null = null;

  let membershipRole: ProjectRole | null = null;

  const projectId = 'project-1';
  const boardId = 'board-1';
  const columnId = 'column-1';
  const sourceColId = 'column-1';
  const targetColId = 'column-2';
  const edgeId = 'edge-1';
  const userId = 1;
  const userEmail = 'admin@node.test';

  const boardBaseUrl = (project = projectId): string =>
    `${baseUrl}/api/project/${project}/board`;

  const authCookieFor = (email = userEmail, id = userId): string => {
    const { refreshToken } = generateAuthTokens(
      id,
      email,
      `session-${Date.now()}`,
    );
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

    // The auth guard checks the session row for the presented token.
    db.session = {
      findUnique: async (args: { where: { id: string } }) => ({
        id: args.where.id,
        userId: 1,
        token: 'stub-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      }),
    };

    db.user = {
      findUnique: async (args: UserFindUniqueArgs) => {
        if (!currentUser) {
          return null;
        }

        if (args.where.email && args.where.email !== currentUser.email) {
          return null;
        }

        return {
          id: currentUser.id,
          name: 'Board User',
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
        if (memberId !== userId || !membershipRole) {
          return null;
        }

        return {
          projectId,
          userId,
          role: membershipRole,
        };
      },
    };

    db.board = {
      create: async (args: BoardCreateArgs) => ({
        id: boardId,
        name: args.data.name,
        projectId: args.data.projectId,
      }),
      findFirst: async () => ({
        id: boardId,
        projectId,
        name: 'Sample Board',
      }),
      findUnique: async (args: BoardFindUniqueArgs) => {
        if (args.select?.projectId) {
          return { projectId };
        }

        return {
          id: boardId,
          projectId,
          name: 'Sample Board',
          workflows: [
            {
              id: sourceColId,
              name: 'To Do',
              boardId,
              limit: -1,
              orderIdx: 0,
              tasks: [],
            },
            {
              id: targetColId,
              name: 'In Progress',
              boardId,
              limit: 5,
              orderIdx: 1,
              tasks: [],
            },
          ],
          edgeConstraints: [
            {
              id: edgeId,
              boardId,
              uId: sourceColId,
              vId: targetColId,
            },
          ],
        };
      },
      update: async (args: BoardUpdateArgs) => ({
        id: args.where.id,
        name: args.data.name ?? 'Updated Board',
        projectId,
      }),
      delete: async (args: BoardDeleteArgs) => ({
        id: args.where.id,
      }),
    };

    db.workflow = {
      createManyAndReturn: async (args: {
        data: Array<WorkflowCreateArgs['data']>;
      }) =>
        args.data.map((workflow, index) => ({
          id: `workflow-${index + 1}`,
          name: workflow.name,
          boardId: workflow.boardId,
          orderIdx: workflow.orderIdx,
          limit: workflow.limit,
        })),
      create: async (args: WorkflowCreateArgs) => ({
        id: columnId,
        name: args.data.name,
        boardId: args.data.boardId,
        orderIdx: args.data.orderIdx,
        limit: args.data.limit,
      }),
      findFirst: async (args: WorkflowFindFirstArgs) => {
        if (args.where?.id !== columnId) {
          return null;
        }

        return {
          id: columnId,
          name: 'Column',
          boardId,
          orderIdx: 2,
          limit: 3,
        };
      },
      update: async (args: WorkflowUpdateArgs) => ({
        id: args.where.id,
        name: args.data.name,
        boardId,
        orderIdx: args.data.orderIdx,
        limit: args.data.limit,
      }),
      delete: async (args: WorkflowDeleteArgs) => ({
        id: args.where.id,
      }),
      findUnique: async () => ({
        id: columnId,
        boardId,
        name: 'Column',
        orderIdx: 2,
        limit: 3,
      }),
    };

    db.task = {
      findMany: async () => [],
    };

    db.edgeConstraint = {
      create: async (args: EdgeConstraintCreateArgs) => ({
        id: edgeId,
        boardId: args.data.boardId,
        uId: args.data.uId,
        vId: args.data.vId,
      }),
      delete: async (args: EdgeConstraintDeleteArgs) => ({
        id: args.where.id,
      }),
      findUnique: async () => null,
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

  test('POST /api/project/:projectId/board/create should allow project admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_ADMIN;

    const response = await fetch(`${boardBaseUrl()}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        name: 'Board One',
      }),
    });

    assert.equal(response.status, 201);
    const data = (await response.json()) as {
      status: string;
      board: { id: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.board.id, boardId);
  });

  test('POST /api/project/:projectId/board/create should reject non-admin member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${boardBaseUrl()}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        name: 'Board One',
      }),
    });

    assert.equal(response.status, 403);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('PATCH /api/project/:projectId/board/update/:boardId should allow project admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_ADMIN;

    const response = await fetch(`${boardBaseUrl()}/update/${boardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        name: 'Updated Board',
      }),
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as { msg: string; status: string };
    assert.equal(data.status, 'success');
    assert.equal(data.msg, 'Board updated Successfully');
  });

  test('PATCH /api/project/:projectId/board/update/:boardId should reject non-admin member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${boardBaseUrl()}/update/${boardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        name: 'Blocked Board',
      }),
    });

    assert.equal(response.status, 403);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('DELETE /api/project/:projectId/board/delete/:boardId should allow project admin', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_ADMIN;

    const response = await fetch(`${boardBaseUrl()}/delete/${boardId}`, {
      method: 'DELETE',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as { msg: string; status: string };
    assert.equal(data.status, 'success');
    assert.equal(data.msg, 'Board deleted Successfully');
  });

  test('DELETE /api/project/:projectId/board/delete/:boardId should reject non-admin member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${boardBaseUrl()}/delete/${boardId}`, {
      method: 'DELETE',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 403);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Insufficient Priviledges');
  });

  test('POST /api/project/:projectId/board/add-column/:boardId should allow project member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${boardBaseUrl()}/add-column/${boardId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        name: 'New Column',
        limit: 5,
        orderIdx: 2,
      }),
    });

    assert.equal(response.status, 201);
    const data = (await response.json()) as {
      status: string;
      column: { id: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.column.id, columnId);
  });

  test('PUT /api/project/:projectId/board/:boardId/update-column/:columnId should allow project member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(
      `${boardBaseUrl()}/${boardId}/update-column/${columnId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookieFor(),
        },
        body: JSON.stringify({
          name: 'Updated Column',
          limit: 4,
          orderIdx: 3,
        }),
      },
    );

    assert.equal(response.status, 200);
    const data = (await response.json()) as { msg: string; status: string };
    assert.equal(data.status, 'success');
    assert.equal(data.msg, 'Column updated Successfully');
  });

  test('DELETE /api/project/:projectId/board/:boardId/remove-column/:columnId should allow project member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(
      `${boardBaseUrl()}/${boardId}/remove-column/${columnId}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: authCookieFor(),
        },
      },
    );

    assert.equal(response.status, 200);
    const data = (await response.json()) as { msg: string; status: string };
    assert.equal(data.status, 'success');
    assert.equal(data.msg, 'Column deleted Successfully');
  });

  test('POST /api/project/:projectId/board/:boardId/create-edge should allow project member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(`${boardBaseUrl()}/${boardId}/create-edge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieFor(),
      },
      body: JSON.stringify({
        sourceColId,
        targetColId,
      }),
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      msg: string;
      status: string;
      edge: { id: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.msg, 'Edge added Successfully');
    assert.equal(data.edge.id, edgeId);
  });

  test('DELETE /api/project/:projectId/board/:boardId/remove-edge/:edgeId should allow project member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_MEMBER;

    const response = await fetch(
      `${boardBaseUrl()}/${boardId}/remove-edge/${edgeId}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: authCookieFor(),
        },
      },
    );

    assert.equal(response.status, 200);
    const data = (await response.json()) as { msg: string; status: string };
    assert.equal(data.status, 'success');
    assert.equal(data.msg, 'Edge deleted Successfully');
  });

  test('GET /api/project/:projectId/board/:boardId should allow viewer', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${boardBaseUrl()}/${boardId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      status: string;
      board: { id: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.board.id, boardId);
  });

  test('GET /api/project/:projectId/board/:boardId should reject non-member', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = null;

    const response = await fetch(`${boardBaseUrl()}/${boardId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 403);
    const data = (await response.json()) as { msg: string };
    assert.equal(data.msg, 'Not a global user');
  });

  test('GET /api/project/:projectId/board/column/:colId should allow viewer', async () => {
    currentUser = {
      id: userId,
      email: userEmail,
      globalRole: 'USER',
    };
    membershipRole = ProjectRole.PROJECT_VIEWER;

    const response = await fetch(`${boardBaseUrl()}/column/${columnId}`, {
      method: 'GET',
      headers: {
        Cookie: authCookieFor(),
      },
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      status: string;
      fcol: { id: string };
    };
    assert.equal(data.status, 'success');
    assert.equal(data.fcol.id, columnId);
  });
});
