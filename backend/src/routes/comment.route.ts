import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';

const commentRouter = Router();

commentRouter.post('/create-thread', (req, res, next) => {
  commentController.createThread(req, res, next);
});
commentRouter.post('/create-comment', (req, res, next) => {
  commentController.createComment(req, res, next);
});

export { commentRouter };
