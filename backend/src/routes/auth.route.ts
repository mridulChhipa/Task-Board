import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { db } from '../config/db';
import type { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middlewares/guards/auth.guard';
import type { AuthenticatedRequest } from '../types/auth.types';

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
    // console.log("=============\nIn logout route\n==============");
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
    const authReq = req as AuthenticatedRequest;
    // console.log(' ================ \n In the /me route \n ==============');
    if (!authReq.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    void next;
    db.user
      .findUnique({
        where: { email: authReq.user.email },
        select: { globalRole: true, notifications: true },
      })
      .then((user) => {
        res.json({
          ...authReq.user,
          role: user?.globalRole ?? null,
          notifications: user?.notifications ?? [],
        });
      })
      .catch(() => {
        res.json({
          ...authReq.user,
          role: null,
        });
      });
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
