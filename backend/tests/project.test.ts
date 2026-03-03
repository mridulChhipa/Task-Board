import type { PrismaClient } from "../generated/prisma/client";

export class ProjectTest {
  async fetchProjects(db: PrismaClient): Promise<void> {
    const allProjects = await db.project.findMany({
      include: {
        members: true
      }
    });
    console.log('All Projects:', JSON.stringify(allProjects, null, 2));
  }
}
