import express from 'express';
import User from '../models/User.js';
import Holding from '../models/Holding.js';
import { getAuthUser } from './user.js';
import { getLatestStockPrice } from './market.js';

const router = express.Router();

const STATIC_LEADERBOARD = [
  { name: 'Arjun Sharma', college: 'IIT Bombay', returns: '+34.2%', portfolio: '₹13,42,000', avatar: '🦁', badge: '👑', xp: 18420 },
  { name: 'Priya Nair', college: 'BITS Pilani', returns: '+29.8%', portfolio: '₹12,98,200', avatar: '🐯', badge: '🥈', xp: 15980 },
  { name: 'Rahul Mehta', college: 'IIM Ahmedabad', returns: '+27.1%', portfolio: '₹12,71,000', avatar: '🦊', badge: '🥉', xp: 14250 },
  { name: 'Sneha Patel', college: 'SRCC Delhi', returns: '+24.5%', portfolio: '₹12,45,000', avatar: '🐺', badge: '⭐', xp: 12100 },
  { name: 'Karthik R', college: 'NIT Trichy', returns: '+22.3%', portfolio: '₹12,23,000', avatar: '🦅', badge: '⭐', xp: 10870 },
  { name: 'Ananya Singh', college: 'DU Commerce', returns: '+19.7%', portfolio: '₹11,97,000', avatar: '🦋', badge: '⭐', xp: 9340 },
  { name: 'Vikram Bose', college: 'VIT Vellore', returns: '+17.2%', portfolio: '₹11,72,000', avatar: '🐉', badge: '⭐', xp: 8120 },
];

router.get('/', async (req, res) => {
  try {
    const currentUser = await getAuthUser(req);
    const dbUsers = await User.find({});

    const formattedDbUsers = await Promise.all(dbUsers.map(async (user) => {
      const holdings = await Holding.find({ userId: user._id });
      let holdingsValue = 0;

      for (const holding of holdings) {
        const price = await getLatestStockPrice(holding.symbol);
        holdingsValue += price * holding.shares;
      }

      const totalVal = user.balance + holdingsValue;
      const initialInvested = 1000000;
      const returnPct = ((totalVal - initialInvested) / initialInvested * 100);
      const returnFormatted = `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(1)}%`;

      const isCurrent = currentUser && currentUser._id.toString() === user._id.toString();

      return {
        name: isCurrent ? `${user.name} (You)` : user.name,
        college: user.college,
        returns: returnFormatted,
        portfolio: `₹${Math.round(totalVal).toLocaleString('en-IN')}`,
        avatar: isCurrent ? '🎯' : '👤',
        badge: '⭐',
        xp: user.xp,
        isUser: isCurrent
      };
    }));

    const combined = [...STATIC_LEADERBOARD, ...formattedDbUsers];
    combined.sort((a, b) => b.xp - a.xp);

    const ranked = combined.map((player, idx) => {
      let badge = '⭐';
      if (idx === 0) badge = '👑';
      else if (idx === 1) badge = '🥈';
      else if (idx === 2) badge = '🥉';

      return {
        rank: idx + 1,
        ...player,
        badge
      };
    });

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
