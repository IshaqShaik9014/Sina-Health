import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes';
import { ENV } from './config/env';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('vercel.app') ||
      (ENV.CLIENT_URL && origin === ENV.CLIENT_URL)
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount REST API
app.use('/api/v1', routes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Clinical Server Error',
  });
});

export default app;
