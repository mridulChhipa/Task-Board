import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Task Board API is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

export default app;