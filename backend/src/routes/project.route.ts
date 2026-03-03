import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticateToken } from '../middlewares/guards/auth.guard';
import { authorizeProjectRole } from '../middlewares/guards/project.guard';
import { ProjectRole } from '../types/project.types';

const projectRouter = Router();

projectRouter.post('/create', (req, res, next) => {
  projectController.createProject(req, res, next);
});

projectRouter.post('/update', (req, res, next) => {
  projectController.updateProject(req, res, next);
});

projectRouter.post('/set-archive-status', (req, res, next) => {
  projectController.setArchiveStatus(req, res, next);
});

projectRouter.post('/assign-user', (req, res, next) => {
  projectController.assignUser(req, res, next);
});

projectRouter.post('/remove-user', (req, res, next) => {
  projectController.removeUser(req, res, next);
});

projectRouter.post('/update-role', (req, res, next) => {
  projectController.updateUserRole(req, res, next);
});

projectRouter.get(
  '/:projectId',
  authenticateToken,
  authorizeProjectRole([
    ProjectRole.PROJECT_ADMIN,
    ProjectRole.PROJECT_MEMBER,
    ProjectRole.PROJECT_VIEWER,
  ]),
  (req, res) => {

  },
);

projectRouter.delete(
  '/:projectId',
  authenticateToken,
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res) => {
    
  },
);

export { projectRouter };
