import type { Request, Response, NextFunction } from 'express';

export function authorizeGlobalAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = req.user;

  if (!user || user.role != 'GLOBAL_ADMIN') {
    return next(
      new Error('Access Denied: Global Admin level priviledges are required'),
    );
  }
}
