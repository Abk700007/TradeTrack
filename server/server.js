import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoute from './routes/user.js';
import marketRoute from './routes/market.js';
import portfolioRoute from './routes/portfolio.js';
import tradeRoute from './routes/trade.js';
import leaderboardRoute from './routes/leaderboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes configuration
app.use('/api/user', userRoute);
app.use('/api/markets', marketRoute);
app.use('/api/portfolio', portfolioRoute);
app.use('/api/trade', tradeRoute);
app.use('/api/leaderboard', leaderboardRoute);

// Simple Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TradeTrack Backend is healthy' });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tradetrack', {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('Connected to MongoDB successfully.');
    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Ensure MongoDB is installed and running locally, or supply MONGODB_URI in server/.env');
  });
