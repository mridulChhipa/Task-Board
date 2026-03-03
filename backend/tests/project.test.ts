import type { PrismaClient } from '../generated/prisma/client';

export class ProjectTest {
  db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async fetchProjects(): Promise<void> {
    const allProjects = await this.db.project.findMany({
      include: {
        members: true,
      },
    });
    console.log('All Projects:', JSON.stringify(allProjects, null, 2));
  }
}
