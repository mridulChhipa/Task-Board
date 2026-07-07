import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import type { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/guards/auth.guard';

const authRouter = Router();

authRouter.post(
  '/register',
  (req: Request, res: Response, next: NextFunction) => {
    authController.register(req, res, next);
  },
);

authRouter.post('/login', (req: Request, res: Response, next: NextFunction) => {
  authController.login(req, res, next);
});

authRouter.post(
  '/logout',
  authenticateToken,
  (req: Request, res: Response, next: NextFunction) => {
    authController.logout(req, res, next);
  },
);

authRouter.patch(
  '/refresh',
  (req: Request, res: Response, next: NextFunction) => {
    authController.refresh(req, res, next);
  },
);

authRouter.get(
  '/me',
  authenticateToken,
  (req: Request, res: Response, next: NextFunction) => {
    authController.me(req, res, next);
  },
);

authRouter.get(
  '/:userId',
  authenticateToken,
  (req: Request, res: Response, next: NextFunction) => {
    authController.fetchUser(req, res, next);
  },
);

authRouter.get(
  '/get-user-by-mail/:userMail',
  authenticateToken,
  (req: Request, res: Response, next: NextFunction) => {
    authController.fetchUserByMail(req, res, next);
  },
);

authRouter.patch(
  '/update-user',
  authenticateToken,
  (req: Request, res: Response, next: NextFunction) => {
    authController.updateUser(req, res, next);
  },
);

export { authRouter };
