import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
app.set('trust proxy', 1); // Railway berada di belakang proxy

const allowed = [
  ...(process.env.FRONTEND_URL || '').split(',').map((u) => u.trim().replace(/\/$/, '')).filter(Boolean),
  ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173']),
];

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowed.includes(origin)),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json({ limit: '50kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Coba lagi sebentar.' } }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
