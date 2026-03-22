import { prisma as db } from '../lib/prisma';
import {
  GlobalRole,
  Priority,
  ProjectLevelRole,
  TaskType,
} from '../generated/prisma/enums';
import { hash } from '../src/utils/hash';

async function resetDatabase() {
  await db.$transaction([
    db.activity.deleteMany(),
    db.comment.deleteMany(),
    db.thread.deleteMany(),
    db.task.deleteMany(),
    db.edgeConstraint.deleteMany(),
    db.workflow.deleteMany(),
    db.board.deleteMany(),
    db.projectMember.deleteMany(),
    db.project.deleteMany(),
    db.notification.deleteMany(),
    db.session.deleteMany(),
    db.user.deleteMany(),
  ]);
}

async function seedUsers() {
  const hashedPassword = await hash('test-password');

  const userData = Array.from({ length: 10 }, (_, idx) => {
    const index = idx + 1;
    return {
      name: `Test User ${index}`,
      email: `testuser${index}@example.com`,
      password: hashedPassword,
      globalRole: index <= 2 ? GlobalRole.GLOBAL_ADMIN : GlobalRole.USER,
      avatar: null,
    };
  });

  const createdUsers = await Promise.all(
    userData.map((user) => db.user.create({ data: user })),
  );

  return createdUsers;
}

async function seedProjectsAndWorkItems(userIds: number[]) {
  const projectSeeds = [
    {
      name: 'Project Atlas',
      description: 'Primary platform modernization project',
      memberIds: userIds.slice(0, 4),
    },
    {
      name: 'Project Beacon',
      description: 'Customer workflow automation project',
      memberIds: userIds.slice(2, 7),
    },
    {
      name: 'Project Cypher',
      description: 'Security hardening and reliability project',
      memberIds: userIds.slice(5, 10),
    },
  ];

  for (const projectSeed of projectSeeds) {
    const [adminId, memberAId, memberBId] = projectSeed.memberIds;
    if (
      adminId === undefined ||
      memberAId === undefined ||
      memberBId === undefined
    ) {
      throw new Error('Insufficient project members for seeding tasks');
    }

    const project = await db.project.create({
      data: {
        name: projectSeed.name,
        description: projectSeed.description,
      },
    });

    await Promise.all(
      projectSeed.memberIds.map((memberId, idx) =>
        db.projectMember.create({
          data: {
            projectId: project.id,
            userId: memberId,
            role:
              idx === 0
                ? ProjectLevelRole.PROJECT_ADMIN
                : idx === 1
                  ? ProjectLevelRole.PROJECT_MEMBER
                  : ProjectLevelRole.PROJECT_VIEWER,
          },
        }),
      ),
    );

    const board = await db.board.create({
      data: {
        name: `${projectSeed.name} Board`,
        projectId: project.id,
      },
    });

    const todoWorkflow = await db.workflow.create({
      data: {
        name: 'to do',
        orderIdx: 0,
        boardId: board.id,
        limit: 20,
      },
    });

    await db.workflow.create({
      data: {
        name: 'in progress',
        orderIdx: 1,
        boardId: board.id,
        limit: 10,
      },
    });

    await db.workflow.create({
      data: {
        name: 'done',
        orderIdx: 2,
        boardId: board.id,
        limit: 30,
      },
    });

    const stories = await Promise.all([
      db.task.create({
        data: {
          title: `${projectSeed.name} Story 1`,
          description: 'Top-level story for feature group 1',
          type: TaskType.STORY,
          priority: Priority.HIGH,
          assignee: memberAId,
          reporter: adminId,
          statusId: todoWorkflow.id,
        },
      }),
      db.task.create({
        data: {
          title: `${projectSeed.name} Story 2`,
          description: 'Top-level story for feature group 2',
          type: TaskType.STORY,
          priority: Priority.MEDIUM,
          assignee: memberBId,
          reporter: adminId,
          statusId: todoWorkflow.id,
        },
      }),
    ]);

    for (const story of stories) {
      await db.task.createMany({
        data: [
          {
            title: `${story.title} - Task Child`,
            description: 'Implementation task under story',
            type: TaskType.TASK,
            priority: Priority.MEDIUM,
            assignee: memberAId,
            reporter: adminId,
            statusId: todoWorkflow.id,
            parentId: story.id,
          },
          {
            title: `${story.title} - Bug Child`,
            description: 'Defect item under story',
            type: TaskType.BUG,
            priority: Priority.CRITICAL,
            assignee: memberBId,
            reporter: adminId,
            statusId: todoWorkflow.id,
            parentId: story.id,
          },
        ],
      });
    }
  }
}

async function main() {
  await resetDatabase();
  const users = await seedUsers();
  await seedProjectsAndWorkItems(users.map((user) => user.id));
}

main()
  .then(async () => {
    console.log('Database reset complete. Test data seeded successfully.');
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seeding failed:', error);
    await db.$disconnect();
    process.exit(1);
  });
