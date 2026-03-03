import type { Request, Response, NextFunction } from 'express';
import type {
  ArchiveBody,
  AssignUserBody,
  CreateBody,
  RemoveUserBody,
  UpdateBody,
  UpdateRoleBody,
} from '../types/project.types';
import { projectService } from '../services/project.service';

export class ProjectController {
  async createProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body: CreateBody = req.body;
      await projectService.create(body);

      res.status(201).json({
        message: 'Project Creation Successful',
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body: UpdateBody = req.body;
      await projectService.update(body);

      res.status(200).json({
        message: 'Project updation Successful',
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async setArchiveStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body: ArchiveBody = req.body;
      await projectService.setArchiveStatus(body);

      res.status(200).json({
        message: 'Updated archive status',
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async assignUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body: AssignUserBody = req.body;
      await projectService.assignUser(body);

      res.status(200).json({
        message: 'Assigned user',
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async removeUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body: RemoveUserBody = req.body;
      await projectService.removeUser(body);

      res.status(200).json({
        message: 'Removed user',
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateUserRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const body: UpdateRoleBody = req.body;
      await projectService.updateUserRole(body);

      res.status(200).json({
        message: 'Updated the role',
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const projectId = req.params.projectId;

      if (typeof projectId !== 'string') {
        throw new Error('Invalid Project ID format');
      }

      const currProject = await projectService.getProject(projectId);
      if (!currProject) {
        throw new Error('Cannot find project with the given id');
      }

      res.status(200).json({
        status: 'Success',
        data: currProject,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const projectId = req.params.projectId;

      if (typeof projectId !== 'string') {
        throw new Error('Invalid Project ID format');
      }

      await projectService.deleteProject(projectId);

      res.status(204).json({
        stauts: 'Delete successful',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const projectController = new ProjectController();
