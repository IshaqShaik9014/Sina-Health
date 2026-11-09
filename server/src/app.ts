import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes';
import { ENV } from './config/env';

const app = express();

app.use(cors({
  origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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
