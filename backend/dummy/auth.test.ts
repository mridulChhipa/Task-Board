import bcrypt from 'bcrypt';
import { GlobalRole, type PrismaClient } from '../generated/prisma/client';

export class AuthTest {
  db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async seedTaskBoardGlobalAdmin(): Promise<void> {
    const existingAdmin = await this.db.user.findUnique({
      where: {
        email: 'admin@taskboard.com',
      },
    });

    if (!existingAdmin) {
      await this.db.user.create({
        data: {
          name: 'Mridul Chhipa',
          email: 'admin@taskboard.com',
          password: await bcrypt.hash('admin@taskboard', 10),
          globalRole: GlobalRole.GLOBAL_ADMIN,
        },
      });
    } else {
      console.log('Admin already exists');
    }
  }

  async fetchUsers(): Promise<void> {
    const allUsers = await this.db.user.findMany({
      include: {
        projects: true,
      },
    });
    console.log('All users:', JSON.stringify(allUsers, null, 2));
  }
}
