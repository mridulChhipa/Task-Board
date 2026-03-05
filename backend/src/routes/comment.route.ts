import { Router } from "express";
import { commentController } from "../controllers/comment.controller";

const commentRouter = Router();

commentRouter.post('/create', (req, res, next) => {
  commentController.create(req, res, next);
});

export { commentRouter };