import express from 'express';
import type { Application, Request, Response } from 'express';
import { authRouter } from './routes/auth.route';
import { errorHandler } from './middlewares/error.handler';
import cookieParser from 'cookie-parser';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  console.log(req.body);
  res.json({ message: 'Hello, Start your Task Board Journey!' });
});

app.use('/api/auth', authRouter);

app.use(errorHandler);

export { app };
