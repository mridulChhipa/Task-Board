import type { PrismaClient } from '../generated/prisma/client';

export class BoardsTest {
  db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async fetchBoards(): Promise<void> {
    const allProjects = await this.db.board.findMany({
      include: {
        workflows: true,
      },
    });
    console.log('All Workflows:', JSON.stringify(allProjects, null, 2));
  }
}
