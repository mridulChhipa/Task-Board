import { prisma as db } from '../lib/prisma';
import { AuthTest } from './auth.test';
import { ProjectTest } from './project.test';

async function main() {
  const authTest = new AuthTest(db);
  await authTest.seedTaskBoardGlobalAdmin();
  await authTest.fetchUsers();
  const projectTest = new ProjectTest(db);
  await projectTest.fetchProjects();
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
