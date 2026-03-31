import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
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

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true  // Allow same-origin in production (frontend served from Express)
    : [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5180'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api', limiter);

// Routes
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

// Serve React frontend in production
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
