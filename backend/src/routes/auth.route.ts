import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import type { Request, Response, NextFunction } from 'express';

const authRouter = Router();

authRouter.post('/register', (req: Request, res: Response, next: NextFunction) => {
  authController.register(req, res, next);
});

authRouter.post('/login', (req: Request, res: Response, next: NextFunction) => {
  authController.login(req, res, next);
});

authRouter.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  authController.logout(req, res, next);
});

authRouter.post('/refresh', (req: Request, res: Response, next: NextFunction) => {
  authController.refresh(req, res, next);
});

export { authRouter };
