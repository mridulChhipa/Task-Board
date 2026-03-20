import { prisma as db } from '../lib/prisma';
import { AuthTest } from './auth.test';
import { ProjectTest } from './project.test';
import { TaskTest } from './task.test';

async function main() {
  const authTest = new AuthTest(db);
  await authTest.seedTaskBoardGlobalAdmin();
  await authTest.fetchUsers();
  const projectTest = new ProjectTest(db);
  await projectTest.fetchProjects();
  const taskTest = new TaskTest(db);
  await taskTest.fetchTasks();
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
