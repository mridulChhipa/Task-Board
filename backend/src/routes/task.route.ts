import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticateToken } from '../middlewares/guards/auth.guard';

const taskRouter = Router({ mergeParams: true });
taskRouter.use(authenticateToken);

taskRouter.post('/create', (req, res, next) => {
  taskController.create(req, res, next);
});

taskRouter.put('/update/:taskId', (req, res, next) => {
  taskController.update(req, res, next);
});

taskRouter.delete('/delete/:taskId', (req, res, next) => {
  taskController.delete(req, res, next);
});

export { taskRouter };
