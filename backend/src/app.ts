import express from 'express'
import type { Application, Request, Response, NextFunction } from "express"

const app: Application = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, TypeScript + Express!' })
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal Server Error' })
});

export { app };