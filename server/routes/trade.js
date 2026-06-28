import express from 'express';
import Holding from '../models/Holding.js';
import Transaction from '../models/Transaction.js';
import { getAuthUser } from './user.js';
import { STOCK_MAPPINGS, getLatestStockPrice } from './market.js';

const router = express.Router();

// POST execute trade (BUY/SELL)
router.post('/', async (req, res) => {
  const { symbol, side, qty, productType } = req.body;

  if (!symbol || !side || !qty || !productType) {
    return res.status(400).json({ error: 'Missing required parameters: symbol, side, qty, productType' });
  }

  const quantity = parseInt(qty);
  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be a positive integer' });
  }

  const info = STOCK_MAPPINGS[symbol];
  if (!info) {
    return res.status(404).json({ error: `Stock symbol ${symbol} is not supported` });
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please log in with your secret key.' });
    }

    // Get live price (falls back to cached/default price seamlessly)
    const price = await getLatestStockPrice(symbol);
    const totalCost = price * quantity;
    const requiredMargin = productType === 'Intraday' ? totalCost * 0.2 : totalCost;

    if (side === 'BUY') {
      if (user.balance < requiredMargin) {
        return res.status(400).json({ error: `Insufficient balance. Required: ₹${requiredMargin.toFixed(2)}, Available: ₹${user.balance.toFixed(2)}` });
      }

      // Deduct balance
      user.balance -= totalCost;

      // Update holdings
      let holding = await Holding.findOne({ userId: user._id, symbol });
      if (holding) {
        const newShares = holding.shares + quantity;
        const newAvgPrice = ((holding.avgPrice * holding.shares) + (price * quantity)) / newShares;
        holding.shares = newShares;
        holding.avgPrice = parseFloat(newAvgPrice.toFixed(2));
        await holding.save();
      } else {
        holding = new Holding({
          userId: user._id,
          symbol,
          name: info.name,
          shares: quantity,
          avgPrice: parseFloat(price.toFixed(2)),
          sector: info.sector
        });
        await holding.save();
      }

      // Save Transaction
      const transaction = new Transaction({
        userId: user._id,
        symbol,
        side,
        qty: quantity,
        price: parseFloat(price.toFixed(2)),
        total: parseFloat(totalCost.toFixed(2)),
        productType
      });
      await transaction.save();

      // Award XP
      user.xp += 50;
      await user.save();

      return res.json({
        message: `Successfully bought ${quantity} shares of ${symbol}`,
        user,
        transaction
      });

    } else if (side === 'SELL') {
      const holding = await Holding.findOne({ userId: user._id, symbol });
      if (!holding || holding.shares < quantity) {
        return res.status(400).json({ 
          error: `Insufficient shares to sell. You own ${holding ? holding.shares : 0} shares of ${symbol}.` 
        });
      }

      // Add to balance
      user.balance += totalCost;

      // Update holdings
      holding.shares -= quantity;
      if (holding.shares === 0) {
        await Holding.deleteOne({ _id: holding._id });
      } else {
        await holding.save();
      }

      // Save Transaction
      const transaction = new Transaction({
        userId: user._id,
        symbol,
        side,
        qty: quantity,
        price: parseFloat(price.toFixed(2)),
        total: parseFloat(totalCost.toFixed(2)),
        productType
      });
      await transaction.save();

      // Award XP
      user.xp += 50;
      await user.save();

      return res.json({
        message: `Successfully sold ${quantity} shares of ${symbol}`,
        user,
        transaction
      });
    } else {
      return res.status(400).json({ error: 'Invalid side. Must be BUY or SELL' });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
