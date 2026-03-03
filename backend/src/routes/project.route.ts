import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticateToken } from '../middlewares/guards/auth.guard';
import { authorizeProjectRole } from '../middlewares/guards/project.guard';
import { ProjectRole } from '../types/project.types';
import { authorizeGlobalAdmin } from '../middlewares/guards/rbac.guard';

const projectRouter = Router();
projectRouter.use(authenticateToken);

projectRouter.post('/create', authorizeGlobalAdmin(), (req, res, next) => {
  projectController.createProject(req, res, next);
});

projectRouter.post(
  '/update',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    projectController.updateProject(req, res, next);
  },
);

projectRouter.post(
  '/set-archive-status',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    projectController.setArchiveStatus(req, res, next);
  },
);

projectRouter.post(
  '/assign-user',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    projectController.assignUser(req, res, next);
  },
);

projectRouter.post(
  '/remove-user',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    projectController.removeUser(req, res, next);
  },
);

projectRouter.post(
  '/update-role',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    projectController.updateUserRole(req, res, next);
  },
);

projectRouter.get(
  '/:projectId',
  authorizeProjectRole([
    ProjectRole.PROJECT_ADMIN,
    ProjectRole.PROJECT_MEMBER,
    ProjectRole.PROJECT_VIEWER,
  ]),
  (req, res, next) => {
    projectController.getProject(req, res, next);
  },
);

projectRouter.delete(
  '/:projectId',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    projectController.deleteProject(req, res, next);
  },
);

export { projectRouter };
