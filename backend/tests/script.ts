import { prisma as db } from '../lib/prisma';
import { AuthTest } from './auth.test';
import { ProjectTest } from './project.test';

async function main() {
  const authTest = new AuthTest();
  await authTest.fetchUsers(db);
  const projectTest = new ProjectTest();
  await projectTest.fetchProjects(db);
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
