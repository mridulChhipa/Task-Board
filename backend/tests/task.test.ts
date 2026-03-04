import type { PrismaClient } from '../generated/prisma/client';

export class TaskTest {
  db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async fetchTasks(): Promise<void> {
    const allTasks = await this.db.task.findMany();
    console.log('All Tasks:', JSON.stringify(allTasks, null, 2));
  }
}
