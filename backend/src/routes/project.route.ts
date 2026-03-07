import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticateToken } from '../middlewares/guards/auth.guard';
import { authorizeProjectRole } from '../middlewares/guards/project.guard';
import { ProjectRole } from '../types/project.types';
import { authorizeGlobalAdmin } from '../middlewares/guards/rbac.guard';
import { boardRouter } from './board.route';

const projectRouter = Router();
projectRouter.use(authenticateToken);

projectRouter.use('/:projectId/board', boardRouter);

projectRouter.post('/create', authorizeGlobalAdmin(), (req, res, next) => {
  projectController.createProject(req, res, next);
});

projectRouter.patch(
  '/update/:projectId',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    projectController.updateProject(req, res, next);
  },
);

projectRouter.patch(
  '/set-archive-status/:projectId',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    projectController.setArchiveStatus(req, res, next);
  },
);

projectRouter.post(
  '/assign-user/:projectId',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    projectController.assignUser(req, res, next);
  },
);

projectRouter.post(
  '/remove-user/:projectId',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    projectController.removeUser(req, res, next);
  },
);

projectRouter.patch(
  '/update-role/:projectId',
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

projectRouter.get(
  '/all-projects',
  authorizeGlobalAdmin,
  (req, res, next) => {
    projectController.fetchGlobalAdminProjects(req, res, next);
  },
);

export { projectRouter };
