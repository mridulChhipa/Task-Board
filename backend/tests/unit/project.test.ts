import { beforeEach, describe, test } from 'node:test';
import assert from 'node:assert';

import { ProjectService } from '../../src/services/project.service';
import { prisma } from '../../lib/prisma';
import type { PrismaClient } from '@prisma/client/extension';
import { ProjectRole } from '../../src/types/project.types';

describe('ProjectService', () => {
  let service: ProjectService;
  const db: PrismaClient = prisma;

  beforeEach(() => {
    service = new ProjectService();
  });

  test('create returns new project', async () => {
    let createArgs: any = null;
    db.project = {
      create: async (args: any) => {
        createArgs = args;
        return {
          id: 'project-1',
          name: args.data.name,
          description: args.data.description,
          isArchived: false,
        };
      },
    };

    const project = await service.create({
      name: 'New Project',
      description: 'Unit test project',
    });

    assert.equal(project.id, 'project-1');
    assert.equal(createArgs?.data.name, 'New Project');
  });

  test('update returns project details with members', async () => {
    let updateArgs: any = null;
    db.project = {
      update: async (args: any) => {
        updateArgs = args;
        return {
          id: args.where.id,
          name: args.data.name,
          description: args.data.description,
          isArchived: args.data.isArchived,
          members: [{ userId: 1 }, { userId: 2 }],
        };
      },
    };

    const result = await service.update('project-1', {
      name: 'Updated Project',
      description: 'Updated',
      isArchived: false,
    });

    assert.equal(updateArgs?.where.id, 'project-1');
    assert.deepEqual(result.members, [1, 2]);
    assert.equal(result.name, 'Updated Project');
  });

  test('setArchiveStatus updates archive flag', async () => {
    let updateArgs: any = null;
    db.project = {
      update: async (args: any) => {
        updateArgs = args;
        return { id: args.where.id };
      },
    };

    await service.setArchiveStatus('project-1', { isArchived: true });

    assert.equal(updateArgs?.data.isArchived, true);
  });

  test('assignUser creates membership', async () => {
    let createdMembership: any = null;
    db.user = {
      findUnique: async () => ({ id: 7, email: 'member@node.test' }),
    };
    db.projectMember = {
      findUnique: async () => null,
      create: async (args: any) => {
        createdMembership = args;
        return {
          projectId: args.data.projectId,
          userId: args.data.userId,
          role: args.data.role,
        };
      },
    };

    await service.assignUser('project-1', {
      userMail: 'member@node.test',
      role: ProjectRole.PROJECT_MEMBER,
    });

    assert.equal(createdMembership?.data.userId, 7);
  });

  test('assignUser rejects unknown user', async () => {
    db.user = {
      findUnique: async () => null,
    };

    await assert.rejects(
      () =>
        service.assignUser('project-1', {
          userMail: 'missing@node.test',
          role: ProjectRole.PROJECT_MEMBER,
        }),
      /given email does not exist/,
    );
  });

  test('removeUser deletes membership', async () => {
    let deleteArgs: any = null;
    db.user = {
      findUnique: async () => ({ id: 5, email: 'member@node.test' }),
    };
    db.projectMember = {
      findUnique: async () => ({ projectId: 'project-1', userId: 5 }),
      delete: async (args: any) => {
        deleteArgs = args;
        return { projectId: 'project-1', userId: 5 };
      },
    };

    await service.removeUser('project-1', { userMail: 'member@node.test' });

    assert.equal(deleteArgs?.where.uniqueUser.userId, 5);
  });

  test('updateUserRole updates membership role', async () => {
    let updateArgs: any = null;
    db.user = {
      findUnique: async () => ({ id: 5, email: 'member@node.test' }),
    };
    db.projectMember = {
      findUnique: async () => ({ projectId: 'project-1', userId: 5 }),
      update: async (args: any) => {
        updateArgs = args;
        return { projectId: 'project-1', userId: 5, role: args.data.role };
      },
    };

    await service.updateUserRole('project-1', {
      userMail: 'member@node.test',
      role: ProjectRole.PROJECT_ADMIN,
    });

    assert.equal(updateArgs?.data.role, ProjectRole.PROJECT_ADMIN);
  });

  test('getProject returns project with members and boards', async () => {
    db.project = {
      findUnique: async () => ({
        id: 'project-1',
        name: 'Project One',
        description: 'Project',
        isArchived: false,
        members: [{ userId: 1 }],
        boards: [
          {
            id: 'board-1',
            workflows: [
              {
                id: 'workflow-1',
                tasks: [{ id: 'task-1' }],
              },
            ],
            edgeConstraints: [],
          },
        ],
      }),
    };

    const project = await service.getProject('project-1');

    assert.equal(project.id, 'project-1');
    assert.equal((project as any).members[0]?.userId, 1);
  });

  test('deleteProject removes project', async () => {
    let deleteArgs: any = null;
    db.project = {
      findUnique: async () => ({ id: 'project-1' }),
      delete: async (args: any) => {
        deleteArgs = args;
        return { id: args.where.id };
      },
    };

    await service.deleteProject('project-1');

    assert.equal(deleteArgs?.where.id, 'project-1');
  });

  test('fetchGlobalAdminProjects maps roles', async () => {
    db.project = {
      findMany: async () => [
        {
          id: 'project-1',
          name: 'Project One',
          description: 'Project',
          isArchived: false,
          members: [{ userId: 1 }],
        },
      ],
    };

    const result = await service.fetchGlobalAdminProjects();

    assert.equal(result[0]?.role, ProjectRole.PROJECT_ADMIN);
    assert.deepEqual(result[0]?.members, [1]);
  });
});
