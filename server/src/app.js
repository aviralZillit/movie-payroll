import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import rateCardRoutes from './routes/rateCardRoutes.js';
import productionRoutes from './routes/productionRoutes.js';
import dealMemoRoutes from './routes/dealMemoRoutes.js';
import timecardRoutes from './routes/timecardRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRateCardRoutes from './routes/adminRateCardRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import importRoutes from './routes/importRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true)
    : [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5180'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rate-cards', rateCardRoutes);
app.use('/api/productions', productionRoutes);
app.use('/api/deal-memos', dealMemoRoutes);
app.use('/api/timecards', timecardRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/rate-cards', adminRateCardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/import', importRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler (for API routes)
app.use('/api', errorHandler);

// Serve React frontend in production (non-Lambda only — Amplify CDN serves the SPA)
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const clientDist = path.join(__dirname, '../../client/dist');
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

// Catch-all error handler
app.use(errorHandler);

// Start server only when not running in Lambda
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

export default app;
