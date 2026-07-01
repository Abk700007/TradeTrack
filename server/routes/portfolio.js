import express from 'express';
import Holding from '../models/Holding.js';
import Transaction from '../models/Transaction.js';
import { getAuthUser } from './user.js';
import { getLatestStockPrice } from './market.js';

const router = express.Router();

// GET portfolio stats & holdings
router.get('/', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const holdings = await Holding.find({ userId: user._id });

    const INITIAL_CAPITAL = 1000000;

    if (holdings.length === 0) {
      const netWorth = user.balance;
      const totalPnL = netWorth - INITIAL_CAPITAL;
      const pnlPct = ((totalPnL / INITIAL_CAPITAL) * 100).toFixed(2);

      return res.json({
        holdings: [],
        totalValue: 0,
        totalInvested: 0,
        netWorth: parseFloat(netWorth.toFixed(2)),
        totalPnL: parseFloat(totalPnL.toFixed(2)),
        pnlPct,
        sectorAllocation: []
      });
    }

    // Fetch current prices in parallel using fallback cache
    const updatedHoldingsPromises = holdings.map(async (holding) => {
      const currentPrice = await getLatestStockPrice(holding.symbol);

      const totalVal = currentPrice * holding.shares;
      const totalInv = holding.avgPrice * holding.shares;
      const pnl = totalVal - totalInv;

      return {
        _id: holding._id,
        symbol: holding.symbol,
        name: holding.name,
        shares: holding.shares,
        avgPrice: holding.avgPrice,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        value: parseFloat(totalVal.toFixed(2)),
        invested: parseFloat(totalInv.toFixed(2)),
        pnl: parseFloat(pnl.toFixed(2)),
        sector: holding.sector
      };
    });

    const updatedHoldings = await Promise.all(updatedHoldingsPromises);

    const totalValue = updatedHoldings.reduce((sum, h) => sum + h.value, 0);
    const totalInvested = updatedHoldings.reduce((sum, h) => sum + h.invested, 0);
    
    // Total Account Net Worth = Cash Balance + Current Stock Holdings Market Value
    const netWorth = user.balance + totalValue;
    // Total Realized + Unrealized P&L = Net Worth - Initial Starting Capital
    const totalPnL = netWorth - INITIAL_CAPITAL;
    const pnlPct = ((totalPnL / INITIAL_CAPITAL) * 100).toFixed(2);

    // Sector Allocation percentage
    const sectorMap = {};
    updatedHoldings.forEach(h => {
      sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.value;
    });

    const sectorAllocation = Object.entries(sectorMap).map(([name, val]) => ({
      name,
      value: parseFloat(((val / totalValue) * 100).toFixed(1))
    })).sort((a, b) => b.value - a.value);

    res.json({
      holdings: updatedHoldings,
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      netWorth: parseFloat(netWorth.toFixed(2)),
      totalPnL: parseFloat(totalPnL.toFixed(2)),
      pnlPct,
      sectorAllocation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET transaction history
router.get('/transactions', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await Transaction.find({ userId: user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
