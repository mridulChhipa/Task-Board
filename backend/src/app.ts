import express from 'express';
import cors from 'cors';
import type { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route';
import { errorHandler } from './middlewares/error.handler';
import { projectRouter } from './routes/project.route';
import { taskRouter } from './routes/task.route';

const app: Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  console.log('Route: /');
  res.json({ message: 'Hello, Start your Task Board Journey!' });
});

app.use('/api/auth', authRouter);
app.use('/api/project', projectRouter);
app.use('/api/task', taskRouter);

app.use(errorHandler);

export { app };
