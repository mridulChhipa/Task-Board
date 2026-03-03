import type { Project } from '../../generated/prisma/client';
import { db } from '../config/db';
import type {
  ArchiveBody,
  AssignUserBody,
  CreateBody,
  RemoveUserBody,
  UpdateBody,
  UpdateRoleBody,
} from '../types/project.types';

export class ProjectService {
  async create({ name, description }: CreateBody): Promise<void> {
    try {
      await db.project.create({
        data: {
          name,
          description,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update({ projectId, name, description }: UpdateBody): Promise<void> {
    try {
      await db.project.update({
        data: {
          name,
          description,
        },
        where: {
          id: projectId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async setArchiveStatus({
    projectId,
    isArchived,
  }: ArchiveBody): Promise<void> {
    try {
      await db.project.update({
        data: {
          isArchived,
        },
        where: {
          id: projectId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Membership related services
  async assignUser({ projectId, userId, role }: AssignUserBody): Promise<void> {
    try {
      const existingMember = await db.projectMember.findUnique({
        where: {
          uniqueUser: {
            projectId,
            userId,
          },
        },
      });

      if (existingMember) {
        throw new Error('User already exists in the project');
      }

      await db.projectMember.create({
        data: {
          projectId,
          userId,
          role,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async removeUser({ projectId, userId }: RemoveUserBody): Promise<void> {
    try {
      const existingMember = await db.projectMember.findUnique({
        where: {
          uniqueUser: {
            projectId,
            userId,
          },
        },
      });

      if (!existingMember) {
        throw new Error('User does not exists in the project');
      }

      await db.projectMember.delete({
        where: {
          uniqueUser: {
            projectId,
            userId,
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateUserRole({
    projectId,
    userId,
    role,
  }: UpdateRoleBody): Promise<void> {
    try {
      const existingMember = await db.projectMember.findUnique({
        where: {
          uniqueUser: {
            projectId,
            userId,
          },
        },
      });

      if (!existingMember) {
        throw new Error(
          'User to update permission does not exists in the project',
        );
      }

      await db.projectMember.update({
        data: {
          role,
        },
        where: {
          uniqueUser: {
            projectId,
            userId,
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getProject(projectId: string): Promise<Project> {
    try {
      const project = await db.project.findUnique({
        where: {
          id: projectId,
        },
      });

      if (!project) {
        throw new Error('Project not found');
      }
      return project;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const project = await db.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      await db.project.delete({
        where: {
          id: projectId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
