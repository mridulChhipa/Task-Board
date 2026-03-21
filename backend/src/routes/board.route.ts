import { Router } from 'express';
import { boardController } from '../controllers/board.controller';
import {
  authorizeBoardIdRole,
  authorizeColumnIdRole,
} from '../middlewares/guards/board.guard';
import { ProjectRole } from '../types/project.types';
import { authorizeProjectRole } from '../middlewares/guards/project.guard';

const boardRouter = Router({
  mergeParams: true,
});

boardRouter.post(
  '/create',
  authorizeProjectRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    boardController.createBoard(req, res, next);
  },
);

boardRouter.post(
  '/:boardId/create-edge',
  authorizeBoardIdRole([ProjectRole.PROJECT_ADMIN, ProjectRole.PROJECT_MEMBER]),
  (req, res, next) => {
    boardController.addEdge(req, res, next);
  },
);

boardRouter.delete(
  '/:boardId/remove-edge/:edgeId',
  authorizeBoardIdRole([ProjectRole.PROJECT_ADMIN, ProjectRole.PROJECT_MEMBER]),
  (req, res, next) => {
    boardController.deleteEdge(req, res, next);
  },
);

boardRouter.patch(
  '/update/:boardId',
  authorizeBoardIdRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    boardController.updateBoard(req, res, next);
  },
);

boardRouter.delete(
  '/delete/:boardId',
  authorizeBoardIdRole([ProjectRole.PROJECT_ADMIN]),
  (req, res, next) => {
    boardController.deleteBoard(req, res, next);
  },
);

boardRouter.post(
  '/add-column/:boardId',
  authorizeBoardIdRole([ProjectRole.PROJECT_ADMIN, ProjectRole.PROJECT_MEMBER]),
  (req, res, next) => {
    boardController.addColumn(req, res, next);
  },
);

boardRouter.delete(
  '/:boardId/remove-column/:columnId',
  authorizeBoardIdRole([ProjectRole.PROJECT_ADMIN, ProjectRole.PROJECT_MEMBER]),
  (req, res, next) => {
    boardController.deleteColumn(req, res, next);
  },
);

boardRouter.put(
  '/:boardId/update-column/:columnId',
  authorizeBoardIdRole([ProjectRole.PROJECT_ADMIN, ProjectRole.PROJECT_MEMBER]),
  (req, res, next) => {
    boardController.updateColumn(req, res, next);
  },
);

boardRouter.get(
  '/:boardId',
  authorizeBoardIdRole([
    ProjectRole.PROJECT_ADMIN,
    ProjectRole.PROJECT_MEMBER,
    ProjectRole.PROJECT_VIEWER,
  ]),
  (req, res, next) => {
    boardController.fetchBoard(req, res, next);
  },
);

boardRouter.get(
  '/column/:colId',
  authorizeColumnIdRole([
    ProjectRole.PROJECT_ADMIN,
    ProjectRole.PROJECT_MEMBER,
    ProjectRole.PROJECT_VIEWER,
  ]),
  (req, res, next) => {
    boardController.fetchCol(req, res, next);
  },
);

export { boardRouter };
