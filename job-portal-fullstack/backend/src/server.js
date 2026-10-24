import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB, { isDbConnected } from './config/db.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import { notFound, errorHandler } from './middleware/errors.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('replace_with')) {
  process.env.JWT_SECRET = 'shubh_job_portal_secure_jwt_secret_key_2026_0123456789';
}

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Health check with DB status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    portal: 'SHUBH JOB PORTAL',
    database: isDbConnected() ? 'connected' : 'connecting_or_memory_fallback',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

app.use(notFound);
app.use(errorHandler);

// Start server immediately so frontend is never blocked
app.listen(port, () => {
  console.log(`🚀 SHUBH JOB PORTAL API listening on http://localhost:${port}`);
  // Connect to MongoDB asynchronously with auto-retry
  connectDB().catch(err => {
    console.warn('⚠️ Initial MongoDB connection notice:', err.message);
  });
});
