import cors from 'cors';

export const corsMiddleware = cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true
})
