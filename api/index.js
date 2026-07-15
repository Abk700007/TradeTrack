import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoute from '../server/routes/user.js';
import marketRoute from '../server/routes/market.js';
import portfolioRoute from '../server/routes/portfolio.js';
import tradeRoute from '../server/routes/trade.js';
import leaderboardRoute from '../server/routes/leaderboard.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serverless MongoDB Connection Caching
let isConnected = false;
async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
  } catch (err) {
    console.error('MongoDB Serverless Connection Error:', err.message);
  }
}

app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// Routes configuration
app.use('/api/user', userRoute);
app.use('/api/markets', marketRoute);
app.use('/api/portfolio', portfolioRoute);
app.use('/api/trade', tradeRoute);
app.use('/api/leaderboard', leaderboardRoute);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TradeTrack Vercel Serverless Backend is healthy' });
});

export default app;
