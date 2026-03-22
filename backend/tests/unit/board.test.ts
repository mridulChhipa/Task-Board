import { beforeEach, describe, test } from 'node:test';
import assert from 'node:assert';

import { BoardService } from '../../src/services/board.service';
import { prisma } from '../../lib/prisma';
import type { PrismaClient } from '@prisma/client/extension';

describe('BoardService', () => {
  let service: BoardService;
  const db: PrismaClient = prisma;

  beforeEach(() => {
    service = new BoardService();
  });

  test('create returns board with default workflows', async () => {
    let workflowCreateCount = 0;
    db.board = {
      create: async (args: any) => ({
        id: 'board-1',
        name: args.data.name,
        projectId: args.data.projectId,
      }),
    };

    db.workflow = {
      create: async (args: any) => {
        workflowCreateCount += 1;
        return {
          id: `workflow-${workflowCreateCount}`,
          name: args.data.name,
          boardId: args.data.boardId,
          orderIdx: args.data.orderIdx,
          limit: args.data.limit,
        };
      },
    };

    const result = await service.create('project-1', 'Board One');

    assert.equal(result.id, 'board-1');
    assert.equal(result.projectId, 'project-1');
    assert.equal(result.workflows.length, 4);
    assert.equal(result.workflows[1]?.limit, 5);
    assert.equal(result.workflows[0]?.name, 'to do');
  });

  test('create rejects board create failure', async () => {
    db.board = {
      create: async () => {
        throw new Error('create failed');
      },
    };

    await assert.rejects(
      () => service.create('project-1', 'Board One'),
      /Error creating board/,
    );
  });

  test('create rejects workflow create failure', async () => {
    db.board = {
      create: async () => ({
        id: 'board-1',
        name: 'Board One',
        projectId: 'project-1',
      }),
    };
    db.workflow = {
      create: async () => {
        throw new Error('error creating workflow');
      },
    };

    await assert.rejects(
      () => service.create('project-1', 'Board One'),
      /Error creating default workflows/,
    );
  });

  test('update throws for missing board', async () => {
    db.board = {
      findFirst: async () => null,
    };

    await assert.rejects(
      () => service.update('board-1', 'Updated Board'),
      /Trying to update non-existent board/,
    );
  });

  test('update rejects update failure', async () => {
    db.board = {
      findFirst: async () => ({ id: 'board-1' }),
      update: async () => {
        throw new Error('update failed');
      },
    };

    await assert.rejects(
      () => service.update('board-1', 'Updated Board'),
      /update failed/,
    );
  });

  test('update writes board name', async () => {
    let updateArgs: any = null;
    db.board = {
      findFirst: async () => ({ id: 'board-1', projectId: 'project-1' }),
      update: async (args: any) => {
        updateArgs = args;
        return {
          id: args.where.id,
          name: args.data.name,
          projectId: 'project-1',
        };
      },
    };

    await service.update('board-1', 'Updated Board');

    assert.equal(updateArgs?.where.id, 'board-1');
    assert.equal(updateArgs?.data.name, 'Updated Board');
  });

  test('addColumn returns created column', async () => {
    db.workflow = {
      create: async (args: any) => ({
        id: 'column-1',
        name: args.data.name,
        boardId: args.data.boardId,
        orderIdx: args.data.orderIdx,
        limit: args.data.limit,
      }),
    };

    const column = await service.addColumn('board-1', 'New Column', 5, 2);

    assert.equal(column.id, 'column-1');
    assert.equal(column.boardId, 'board-1');
    assert.equal(column.name, 'New Column');
  });

  test('addColumn rejects create failure', async () => {
    db.workflow = {
      create: async () => {
        throw new Error('create failed');
      },
    };

    await assert.rejects(
      () => service.addColumn('board-1', 'New Column', 5, 2),
      /Error adding workflow\/column/,
    );
  });

  test('updateColumn updates and skips sync when no stories', async () => {
    let updateArgs: any = null;
    db.workflow = {
      findFirst: async () => ({ id: 'column-1', boardId: 'board-1' }),
      update: async (args: any) => {
        updateArgs = args;
        return {
          id: args.where.id,
          name: args.data.name,
          boardId: 'board-1',
          orderIdx: args.data.orderIdx,
          limit: args.data.limit,
        };
      },
    };
    db.task = {
      findMany: async () => [],
    };

    await service.updateColumn('column-1', 'board-1', 'Updated', 4, 3);

    assert.equal(updateArgs?.where.id, 'column-1');
    assert.equal(updateArgs?.data.name, 'Updated');
  });

  test('updateColumn rejects missing column', async () => {
    db.workflow = {
      findFirst: async () => null,
    };

    await assert.rejects(
      () => service.updateColumn('column-1', 'board-1', 'Updated', 4, 3),
      /Non-existent column/,
    );
  });

  test('updateColumn rejects wrong board', async () => {
    db.workflow = {
      findFirst: async () => ({ id: 'column-1', boardId: 'other-board' }),
    };

    await assert.rejects(
      () => service.updateColumn('column-1', 'board-1', 'Updated', 4, 3),
      /does not exists in this board/,
    );
  });

  test('updateColumn rejects update failure', async () => {
    db.workflow = {
      findFirst: async () => ({ id: 'column-1', boardId: 'board-1' }),
      update: async () => {
        throw new Error('update failed');
      },
    };

    await assert.rejects(
      () => service.updateColumn('column-1', 'board-1', 'Updated', 4, 3),
      /update failed/,
    );
  });

  test('updateColumn rejects task lookup failure', async () => {
    db.workflow = {
      findFirst: async () => ({ id: 'column-1', boardId: 'board-1' }),
      update: async () => ({ id: 'column-1' }),
    };
    db.task = {
      findMany: async () => {
        throw new Error('findMany failed');
      },
    };

    await assert.rejects(
      () => service.updateColumn('column-1', 'board-1', 'Updated', 4, 3),
      /findMany failed/,
    );
  });

  test('deleteColumn removes column', async () => {
    let deleteArgs: any = null;
    db.workflow = {
      findFirst: async () => ({ id: 'column-1', boardId: 'board-1' }),
      delete: async (args: any) => {
        deleteArgs = args;
        return { id: args.where.id };
      },
    };

    await service.deleteColumn('column-1', 'board-1');

    assert.equal(deleteArgs?.where.id, 'column-1');
  });

  test('deleteColumn rejects missing column', async () => {
    db.workflow = {
      findFirst: async () => null,
    };

    await assert.rejects(
      () => service.deleteColumn('column-1', 'board-1'),
      /Column Deletion/,
    );
  });

  test('deleteColumn rejects wrong board', async () => {
    db.workflow = {
      findFirst: async () => ({ id: 'column-1', boardId: 'other-board' }),
    };

    await assert.rejects(
      () => service.deleteColumn('column-1', 'board-1'),
      /Column Deletion/,
    );
  });

  test('deleteColumn rejects delete failure', async () => {
    db.workflow = {
      findFirst: async () => ({ id: 'column-1', boardId: 'board-1' }),
      delete: async () => {
        throw new Error('delete failed');
      },
    };

    await assert.rejects(
      () => service.deleteColumn('column-1', 'board-1'),
      /Column Deletion/,
    );
  });

  test('addEdge creates edge for board', async () => {
    db.board = {
      findFirst: async () => ({ id: 'board-1' }),
    };
    db.edgeConstraint = {
      create: async (args: any) => ({
        id: 'edge-1',
        boardId: args.data.boardId,
        uId: args.data.uId,
        vId: args.data.vId,
      }),
    };

    const edge = await service.addEdge('board-1', 'col-1', 'col-2');

    assert.equal(edge.id, 'edge-1');
    assert.equal(edge.boardId, 'board-1');
    assert.equal(edge.uId, 'col-1');
  });

  test('addEdge rejects missing board', async () => {
    db.board = {
      findFirst: async () => null,
    };

    await assert.rejects(
      () => service.addEdge('board-1', 'col-1', 'col-2'),
      /add edge to non-existent board/,
    );
  });

  test('addEdge rejects create failure', async () => {
    db.board = {
      findFirst: async () => ({ id: 'board-1' }),
    };
    db.edgeConstraint = {
      create: async () => {
        throw new Error('create failed');
      },
    };

    await assert.rejects(
      () => service.addEdge('board-1', 'col-1', 'col-2'),
      /create failed/,
    );
  });

  test('deleteEdge removes edge', async () => {
    let deleteArgs: any = null;
    db.edgeConstraint = {
      delete: async (args: any) => {
        deleteArgs = args;
        return { id: args.where.id };
      },
    };

    await service.deleteEdge('board-1', 'edge-1');

    assert.equal(deleteArgs?.where.id, 'edge-1');
  });

  test('deleteEdge rejects delete failure', async () => {
    db.edgeConstraint = {
      delete: async () => {
        throw new Error('delete failed');
      },
    };

    await assert.rejects(
      () => service.deleteEdge('board-1', 'edge-1'),
      /Failed to delete edge/,
    );
  });

  test('deleteBoard removes board', async () => {
    let deleteArgs: any = null;
    db.board = {
      delete: async (args: any) => {
        deleteArgs = args;
        return { id: args.where.id };
      },
    };

    await service.deleteBoard('board-1');

    assert.equal(deleteArgs?.where.id, 'board-1');
  });

  test('deleteBoard rejects delete failure', async () => {
    db.board = {
      delete: async () => {
        throw new Error('delete failed');
      },
    };

    await assert.rejects(
      () => service.deleteBoard('board-1'),
      /Board Deletions/,
    );
  });

  test('fetchBoard returns board dto', async () => {
    db.board = {
      findUnique: async () => ({
        id: 'board-1',
        projectId: 'project-1',
        name: 'Board One',
        workflows: [
          {
            id: 'col-1',
            name: 'To Do',
            boardId: 'board-1',
            limit: -1,
            orderIdx: 0,
            tasks: [{ id: 'task-1' }],
          },
        ],
        edgeConstraints: [
          {
            id: 'edge-1',
            boardId: 'board-1',
            uId: 'col-1',
            vId: 'col-2',
          },
        ],
      }),
    };

    const board = await service.fetchBoard('board-1');

    assert.equal(board.id, 'board-1');
    assert.equal(board.workflows[0]?.tasks?.[0], 'task-1');
    assert.equal(board.edgeConstraints[0]?.id, 'edge-1');
  });

  test('fetchBoard rejects missing board', async () => {
    db.board = {
      findUnique: async () => null,
    };

    await assert.rejects(() => service.fetchBoard('board-1'), /fetching board/);
  });

  test('fetchBoard rejects fetch failure', async () => {
    db.board = {
      findUnique: async () => {
        throw new Error('fetch failed');
      },
    };

    await assert.rejects(() => service.fetchBoard('board-1'), /fetch failed/);
  });

  test('fetchCol returns column dto', async () => {
    db.workflow = {
      findUnique: async () => ({
        id: 'col-1',
        boardId: 'board-1',
        name: 'To Do',
        orderIdx: 0,
        limit: -1,
      }),
    };

    const col = await service.fetchCol('col-1');

    assert.equal(col.id, 'col-1');
    assert.equal(col.boardId, 'board-1');
  });

  test('fetchCol rejects missing column', async () => {
    db.workflow = {
      findUnique: async () => null,
    };

    await assert.rejects(() => service.fetchCol('col-1'), /fetching board/);
  });

  test('fetchCol rejects fetch failure', async () => {
    db.workflow = {
      findUnique: async () => {
        throw new Error('fetch failed');
      },
    };

    await assert.rejects(() => service.fetchCol('col-1'), /fetch failed/);
  });
});
