import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { employeesRouter } from './routes/employees.js';

export const createApp = () => {
  const app = express();
  
  // CORS configuration - MUST come before helmet
  const corsOptions = {
    origin: process.env.FRONTEND_URL || '*', // Add your frontend URL to .env
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
  };
  
  app.use(cors(corsOptions));
  
  // Handle preflight requests explicitly
  app.options('*', cors(corsOptions));
  
  // Helmet with CORS-friendly settings
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  
  app.use(express.json());

  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
  app.use(limiter);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/employees', employeesRouter);

  // Global error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
};

export type AppType = ReturnType<typeof createApp>;