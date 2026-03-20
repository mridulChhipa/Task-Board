import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticateToken } from '../middlewares/guards/auth.guard';
import { authorizeStatusIdRole, authorizeTaskIdRole } from '../middlewares/guards/task.guard';
import { ProjectRole } from '../types/project.types';

const taskRouter = Router({ mergeParams: true });
taskRouter.use(authenticateToken);

taskRouter.post(
  '/create',
  authorizeStatusIdRole([ProjectRole.PROJECT_ADMIN, ProjectRole.PROJECT_MEMBER]),
  (req, res, next) => {
    taskController.create(req, res, next);
  },
);

taskRouter.put(
  '/update/:taskId',
  authorizeTaskIdRole([ProjectRole.PROJECT_ADMIN, ProjectRole.PROJECT_MEMBER]),
  (req, res, next) => {
    taskController.update(req, res, next);
  },
);

taskRouter.delete(
  '/delete/:taskId',
  authorizeTaskIdRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    taskController.delete(req, res, next);
  },
);

taskRouter.get(
  '/:taskId',
  authorizeTaskIdRole([
    ProjectRole.PROJECT_ADMIN,
    ProjectRole.PROJECT_MEMBER,
    ProjectRole.PROJECT_VIEWER,
  ]),
  (req, res, next) => {
    taskController.getTask(req, res, next);
  },
);

export { taskRouter };
