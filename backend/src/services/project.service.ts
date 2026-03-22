import type { Project } from '../../generated/prisma/client';
import { db } from '../config/db';
import {
  ProjectRole,
  type ArchiveBody,
  type AssignUserBody,
  type CreateBody,
  type ProjectDetails,
  type RemoveUserBody,
  type UpdateBody,
  type UpdateRoleBody,
} from '../types/project.types';

export class ProjectService {
  async create({ name, description }: CreateBody): Promise<Project> {
    try {
      const project = await db.project.create({
        data: {
          name,
          description,
        },
      });
      return project;
    } catch (error) {
      throw Error('Error creating project: ', { cause: error });
    }
  }

  async update(
    projectId: string,
    { name, description, isArchived }: UpdateBody,
  ): Promise<ProjectDetails> {
    try {
      const updatedProject = await db.project.update({
        data: {
          name,
          description,
          isArchived,
        },
        where: {
          id: projectId,
        },
        include: {
          members: true,
        },
      });

      if (!updatedProject) {
        throw new Error("Can't update");
      }

      const retProj: ProjectDetails = {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        isArchived: updatedProject.isArchived,
        members: updatedProject.members.map((member) => {
          return member.userId;
        }),
      };

      return retProj;
    } catch (error) {
      void error;
      throw error;
    }
  }

  async setArchiveStatus(
    projectId: string,
    { isArchived }: ArchiveBody,
  ): Promise<void> {
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
      throw new Error('Error archiving project', { cause: error });
    }
  }

  async assignUser(
    projectId: string,
    { userMail, role }: AssignUserBody,
  ): Promise<void> {
    try {
      const user = await db.user.findUnique({
        where: {
          email: userMail,
        },
      });
      if (!user) {
        throw new Error('User with given email does not exist');
      }
      const userId = user.id;
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
      void error;
      throw error;
    }
  }

  async removeUser(
    projectId: string,
    { userMail }: RemoveUserBody,
  ): Promise<void> {
    try {
      const user = await db.user.findUnique({
        where: {
          email: userMail,
        },
      });
      if (!user) {
        throw new Error('User does not exist');
      }
      const userId = user.id;
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
      void error;
      throw new Error('Error removing user from project: ', { cause: error });
    }
  }

  async updateUserRole(
    projectId: string,
    { userMail, role }: UpdateRoleBody,
  ): Promise<void> {
    try {
      const user = await db.user.findUnique({
        where: {
          email: userMail,
        },
      });
      if (!user) {
        throw new Error('User does not exist');
      }
      const userId = user.id;
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
      throw new Error('Error updating user role: ', { cause: error });
    }
  }

  async getProject(projectId: string): Promise<Project> {
    try {
      const project = await db.project.findUnique({
        where: {
          id: projectId,
        },
        include: {
          members: true,
          boards: {
            include: {
              workflows: {
                include: {
                  tasks: true,
                },
              },
              edgeConstraints: true,
            },
          },
        },
      });

      if (!project) {
        throw new Error('Project not found from get');
      }
      return project;
    } catch (error) {
      throw new Error('Error fetching project', { cause: error });
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const project = await db.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error('Project not found from delete');
      }

      await db.project.delete({
        where: {
          id: projectId,
        },
      });
    } catch (error) {
      throw new Error('Error deleting project: ', { cause: error });
    }
  }

  async fetchGlobalAdminProjects(): Promise<ProjectDetails[]> {
    try {
      const allGlobalProjects: ProjectDetails[] = [];
      const allFetches = await db.project.findMany({
        include: {
          members: true,
        },
      });
      if (allFetches) {
        for (const project of allFetches) {
          allGlobalProjects.push({
            id: project.id,
            name: project.name,
            description: project.description,
            role: ProjectRole.PROJECT_ADMIN,
            members: project.members.map((member) => member.userId),
            isArchived: project.isArchived,
          });
        }
      }
      return allGlobalProjects;
    } catch (error) {
      throw new Error(
        "Can't fetch projects for global admin [fetchglobaladmin]",
        {
          cause: error,
        },
      );
    }
  }
}

export const projectService = new ProjectService();
