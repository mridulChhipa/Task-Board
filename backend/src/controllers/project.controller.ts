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
      const project = await projectService.create(body);

      res.status(201).json({
        message: 'Project Creation Successful',
        data: project,
      });

      next();
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
      const projectId = req.params.projectId;
      if (typeof projectId !== 'string') {
        throw new Error('Invalid type for projectId');
      }

      const project = await projectService.update(projectId, body);

      res.status(200).json({
        message: 'Project updation Successful',
        data: project,
      });

      next();
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
      const projectId = req.params.projectId;
      if (typeof projectId !== 'string') {
        throw new Error('Invalid type for projectId');
      }
      await projectService.setArchiveStatus(projectId, body);

      res.status(200).json({
        message: 'Updated archive status',
      });

      next();
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
      const projectId = req.params.projectId;
      if (typeof projectId !== 'string') {
        throw new Error('Invalid type for projectId');
      }

      await projectService.assignUser(projectId, body);

      res.status(200).json({
        message: 'Assigned user',
      });

      next();
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
      const projectId = req.params.projectId;
      if (typeof projectId !== 'string') {
        throw new Error('Invalid type for projectId');
      }

      await projectService.removeUser(projectId, body);

      res.status(200).json({
        message: 'Removed user',
      });

      next();
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
      const projectId = req.params.projectId;
      if (typeof projectId !== 'string') {
        throw new Error('Invalid type for projectId');
      }

      await projectService.updateUserRole(projectId, body);

      res.status(200).json({
        message: 'Updated the role',
      });

      next();
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

      next();
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

      next();
    } catch (err) {
      next(err);
    }
  }
}

export const projectController = new ProjectController();
