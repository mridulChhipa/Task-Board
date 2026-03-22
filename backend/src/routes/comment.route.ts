import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authenticateToken } from '../middlewares/guards/auth.guard';
import {
  authoriseCommentAuthor,
  authoriseThreadAuthor,
  authorizeCommentIdRole,
  authorizeTaskIdRole,
  authorizeThreadIdRole,
} from '../middlewares/guards/comment.guard';
import { ProjectRole } from '../types/project.types';

const commentRouter = Router();

commentRouter.use(authenticateToken);

commentRouter.post(
  '/create-thread',
  authorizeTaskIdRole([ProjectRole.PROJECT_ADMIN, ProjectRole.PROJECT_MEMBER]),
  (req, res, next) => {
    commentController.createThread(req, res, next);
  },
);
commentRouter.post(
  '/create-comment',
  authorizeTaskIdRole([ProjectRole.PROJECT_ADMIN, ProjectRole.PROJECT_MEMBER]),
  (req, res, next) => {
    commentController.createComment(req, res, next);
  },
);

commentRouter.patch(
  '/update-thread/:tid',
  authoriseThreadAuthor(),
  (req, res, next) => {
    commentController.updateThread(req, res, next);
  },
);

commentRouter.patch(
  '/update-comment/:cid',
  authoriseCommentAuthor(),
  (req, res, next) => {
    commentController.updateComment(req, res, next);
  },
);

commentRouter.patch(
  '/delete-thread/:tid',
  authoriseThreadAuthor(),
  (req, res, next) => {
    commentController.deleteThread(req, res, next);
  },
);

commentRouter.patch(
  '/delete-comment/:cid',
  authoriseCommentAuthor(),
  (req, res, next) => {
    console.log(req.body);
    commentController.deleteComment(req, res, next);
  },
);

commentRouter.get(
  '/t/:cid',
  authorizeCommentIdRole([
    ProjectRole.PROJECT_ADMIN,
    ProjectRole.PROJECT_MEMBER,
    ProjectRole.PROJECT_VIEWER,
  ]),
  (req, res, next) => {
    commentController.fetchComment(req, res, next);
  },
);

commentRouter.get(
  '/:tid',
  authorizeThreadIdRole([
    ProjectRole.PROJECT_ADMIN,
    ProjectRole.PROJECT_MEMBER,
    ProjectRole.PROJECT_VIEWER,
  ]),
  (req, res, next) => {
    commentController.fetchThread(req, res, next);
  },
);

export { commentRouter };
