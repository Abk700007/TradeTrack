import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Holding from '../models/Holding.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Helper to authenticate user by x-secret-key header
export async function getAuthUser(req) {
  const secretKey = req.headers['x-secret-key'];
  if (!secretKey) return null;
  const user = await User.findOne({ secretKey });
  return user;
}

// Signup route
router.post('/signup', async (req, res) => {
  const { name, username, college } = req.body;

  if (!name || !username) {
    return res.status(400).json({ error: 'Name and Username are required' });
  }

  try {
    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'Username is already taken. Please choose another.' });
    }

    // Generate unique 12-char secret key format: TT-XXXX-XXXX
    const randHex1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const randHex2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const secretKey = `TT-${randHex1}-${randHex2}`;

    const user = new User({
      name,
      username: username.toLowerCase().trim(),
      secretKey,
      college: college || 'Investor',
      balance: 1000000,
      xp: 0,
      streak: 1,
      completedChallenges: []
    });

    await user.save();

    res.json({
      message: 'Account created successfully',
      user,
      secretKey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { secretKey } = req.body;

  if (!secretKey) {
    return res.status(400).json({ error: 'Secret Key is required' });
  }

  try {
    const user = await User.findOne({ secretKey: secretKey.trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid Secret Key. Please check and try again.' });
    }

    res.json({
      message: 'Logged in successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET current user profile
router.get('/', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Secret key missing or invalid.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST toggle completed challenge
router.post('/challenges/toggle', async (req, res) => {
  const { challengeId } = req.body;
  if (challengeId === undefined) {
    return res.status(400).json({ error: 'challengeId is required' });
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const index = user.completedChallenges.indexOf(challengeId);
    if (index === -1) {
      user.completedChallenges.push(challengeId);
      user.xp += 50;
    } else {
      user.completedChallenges.splice(index, 1);
      user.xp = Math.max(0, user.xp - 50);
    }
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE account and all associated user data from DB
router.delete('/delete-account', async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Secret key missing or invalid.' });
    }

    // Delete all holdings for this user
    await Holding.deleteMany({ userId: user._id });

    // Delete all transactions for this user
    await Transaction.deleteMany({ userId: user._id });

    // Delete the user record
    await User.deleteOne({ _id: user._id });

    res.json({
      message: 'Account and all associated holdings and transaction history deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
