import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let stat = 500;
  let msg = 'An unexpected error occurred';

  if (err instanceof AppError) {
    stat = err.status;
    msg = err.message;
  } else if (err instanceof Error) {
    // Legacy fallback for errors that have not been converted to AppError.
    msg = err.message;

    if (
      msg.includes('Invalid credentials') ||
      msg.includes('Authentication required')
    ) {
      stat = 401;
    } else if (msg.includes('exists')) {
      stat = 400;
    } else if (msg.includes('expired') || msg.includes('invalid')) {
      stat = 403;
    }
  }

  console.error(`[Error]: ${msg}`);

  res.status(stat).json({
    status: 'error',
    msg,
  });

  void next;
};
