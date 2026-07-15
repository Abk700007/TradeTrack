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

// Serverless MongoDB Connection Cache
let cachedDb = null;

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing in Vercel settings.');
  }

  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  // Set bufferCommands to false to fail fast with helpful error instead of 10s timeout
  mongoose.set('bufferCommands', false);

  cachedDb = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000
  });

  return cachedDb;
}

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('MongoDB Serverless Connection Error:', err.message);
    res.status(500).json({
      error: `Database connection error: ${err.message}. Please ensure MONGODB_URI is set in Vercel and MongoDB Atlas Network Access allows 0.0.0.0/0.`
    });
  }
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
