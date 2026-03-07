import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';

const commentRouter = Router();

commentRouter.post('/create-thread', (req, res, next) => {
  commentController.createThread(req, res, next);
});
commentRouter.post('/create-comment', (req, res, next) => {
  commentController.createComment(req, res, next);
});

commentRouter.post('/update-thread/:tid', (req, res, next) => {
  commentController.updateThread(req, res, next);
});

commentRouter.post('/update-comment/:cid', (req, res, next) => {
  commentController.updateComment(req, res, next);
});

commentRouter.post('/delete-thread/:tid', (req, res, next) => {
  commentController.deleteThread(req, res, next);
});

commentRouter.post('/delete-comment/:cid', (req, res, next) => {
  commentController.deleteComment(req, res, next);
});

commentRouter.get('t/:cid', (req, res, next) => {
  commentController.fetchComment(req, res, next);
});

commentRouter.get('/:tid', (req, res, next) => {
  commentController.fetchThread(req, res, next);
});

export { commentRouter };
