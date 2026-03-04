import { Router } from 'express';
import { boardController } from '../controllers/board.controller';

const boardRouter = Router({
  mergeParams: true,
});

boardRouter.post('/create', (req, res, next) => {
  boardController.createBoard(req, res, next);
});

boardRouter.patch('/update/:boardId', (req, res, next) => {
  boardController.updateBoard(req, res, next);
});

boardRouter.post('/add-column/:boardId', (req, res, next) => {
  boardController.addColumn(req, res, next);
});

boardRouter.delete('/remove-column/:boardId/:columnId', (req, res, next) => {
  boardController.deleteColumn(req, res, next);
});

boardRouter.put('/update-column/:boardId/:columnId', (req, res, next) => {
  boardController.updateColumn(req, res, next);
});

export { boardRouter };
