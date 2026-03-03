import type { PrismaClient } from '../generated/prisma/client';

export class AuthTest {
  async fetchUsers(db: PrismaClient): Promise<void> {
    const allUsers = await db.user.findMany({
      include: {
        projects: true,
      },
    });
    console.log('All users:', JSON.stringify(allUsers, null, 2));
  }
}
