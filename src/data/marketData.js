// Mock Indian Stock Market Data
export const NIFTY_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2847.30, change: 23.45, changePercent: 0.83, volume: '12.4M', sector: 'Energy', marketCap: '19.2L Cr' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3921.55, change: -45.20, changePercent: -1.14, volume: '3.1M', sector: 'IT', marketCap: '14.2L Cr' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1678.90, change: 12.30, changePercent: 0.74, volume: '8.7M', sector: 'Finance', marketCap: '12.8L Cr' },
  { symbol: 'INFY', name: 'Infosys', price: 1543.20, change: -18.75, changePercent: -1.20, volume: '5.2M', sector: 'IT', marketCap: '6.4L Cr' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1089.45, change: 9.60, changePercent: 0.89, volume: '11.3M', sector: 'Finance', marketCap: '7.7L Cr' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2234.80, change: 5.40, changePercent: 0.24, volume: '2.8M', sector: 'FMCG', marketCap: '5.2L Cr' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 812.65, change: 14.20, changePercent: 1.78, volume: '18.6M', sector: 'Finance', marketCap: '7.3L Cr' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 7234.50, change: 89.30, changePercent: 1.25, volume: '1.9M', sector: 'Finance', marketCap: '4.4L Cr' },
  { symbol: 'WIPRO', name: 'Wipro', price: 467.85, change: -8.10, changePercent: -1.70, volume: '6.4M', sector: 'IT', marketCap: '2.4L Cr' },
  { symbol: 'TITAN', name: 'Titan Company', price: 3412.70, change: 45.80, changePercent: 1.36, volume: '1.2M', sector: 'Consumer', marketCap: '3.0L Cr' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2678.40, change: -34.20, changePercent: -1.26, volume: '4.1M', sector: 'Diversified', marketCap: '3.0L Cr' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 12456.30, change: 123.40, changePercent: 1.00, volume: '0.8M', sector: 'Auto', marketCap: '3.8L Cr' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 2891.60, change: -22.30, changePercent: -0.77, volume: '1.5M', sector: 'Consumer', marketCap: '2.8L Cr' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', price: 267.45, change: 3.80, changePercent: 1.44, volume: '22.1M', sector: 'Energy', marketCap: '3.4L Cr' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 987.30, change: 18.40, changePercent: 1.90, volume: '14.2M', sector: 'Auto', marketCap: '3.6L Cr' },
];

export const MARKET_INDICES = [
  { name: 'NIFTY 50', value: '24,198.35', change: '+142.45', changePercent: '+0.59%', isUp: true },
  { name: 'SENSEX', value: '79,576.12', change: '+443.21', changePercent: '+0.56%', isUp: true },
  { name: 'NIFTY BANK', value: '51,834.70', change: '-89.30', changePercent: '-0.17%', isUp: false },
  { name: 'NIFTY IT', value: '38,234.85', change: '-456.20', changePercent: '-1.18%', isUp: false },
  { name: 'NIFTY MIDCAP', value: '56,123.45', change: '+234.10', changePercent: '+0.42%', isUp: true },
];

// Generate candlestick-style data
export function generateChartData(basePrice, days = 30, volatility = 0.02) {
  const data = [];
  let price = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const open = price;
    const change = (Math.random() - 0.48) * volatility * price;
    const close = Math.max(price + change, price * 0.8);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 10000000 + 1000000);

    data.push({
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      open: parseFloat(open.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      volume,
      value: parseFloat(close.toFixed(2)),
    });

    price = close;
  }

  return data;
}

export const ACHIEVEMENTS = [
  { id: 'first_trade', icon: '🎯', name: 'First Blood', desc: 'Complete your first trade', xp: 50, unlocked: true, rarity: 'common' },
  { id: 'profit_streak', icon: '🔥', name: 'Hot Streak', desc: '5 profitable trades in a row', xp: 200, unlocked: true, rarity: 'rare' },
  { id: 'big_win', icon: '💎', name: 'Diamond Hands', desc: 'Single trade profit of ₹10,000+', xp: 500, unlocked: false, rarity: 'epic' },
  { id: 'diversified', icon: '🌐', name: 'Diversifier', desc: 'Hold stocks in 5+ sectors', xp: 150, unlocked: true, rarity: 'uncommon' },
  { id: 'day_trader', icon: '⚡', name: 'Speed Demon', desc: 'Complete 10 intraday trades', xp: 300, unlocked: false, rarity: 'rare' },
  { id: 'leaderboard', icon: '🏆', name: 'Top Tier', desc: 'Reach top 10 on leaderboard', xp: 1000, unlocked: false, rarity: 'legendary' },
  { id: 'week_streak', icon: '📅', name: 'Committed', desc: 'Maintain a 7-day streak', xp: 250, unlocked: true, rarity: 'uncommon' },
  { id: 'sector_master', icon: '🎓', name: 'Sector Master', desc: 'Trade all major sectors', xp: 400, unlocked: false, rarity: 'epic' },
];

export const RANKS = [
  { id: 'beginner', name: 'Beginner Trader', icon: '🌱', minXP: 0, maxXP: 500, color: '#94a3b8', cssClass: 'rank-beginner' },
  { id: 'swing', name: 'Swing Hunter', icon: '📈', minXP: 500, maxXP: 2000, color: '#4ade80', cssClass: 'rank-swing' },
  { id: 'wolf', name: 'Market Wolf', icon: '🐺', minXP: 2000, maxXP: 5000, color: '#00f5a0', cssClass: 'rank-wolf' },
  { id: 'quant', name: 'Quant Master', icon: '🧠', minXP: 5000, maxXP: 15000, color: '#a78bfa', cssClass: 'rank-quant' },
  { id: 'beast', name: 'Wall Street Beast', icon: '👑', minXP: 15000, maxXP: Infinity, color: '#ffd700', cssClass: 'rank-beast' },
];

export const DAILY_CHALLENGES = [
  { id: 1, icon: '📊', title: 'Volume Watcher', desc: 'Trade a stock with volume > 10M', xp: 75, completed: false, type: 'trade' },
  { id: 2, icon: '🎯', title: 'Precision Strike', desc: 'Close a trade with 2%+ profit', xp: 100, completed: true, type: 'profit' },
  { id: 3, icon: '🌐', title: 'Sector Diversify', desc: 'Buy stocks in 3 different sectors', xp: 80, completed: false, type: 'portfolio' },
  { id: 4, icon: '📰', title: 'Market Open', desc: 'Execute a trade in the first 30 min', xp: 60, completed: true, type: 'timing' },
  { id: 5, icon: '🔍', title: 'Deep Research', desc: 'View 5 stock detail pages', xp: 40, completed: false, type: 'learning' },
];

export const LEADERBOARD_DATA = [
  { rank: 1, name: 'Arjun Sharma', college: 'IIT Bombay', returns: '+34.2%', portfolio: '₹14,21,450', avatar: '🦁', badge: '👑', xp: 18420 },
  { rank: 2, name: 'Priya Nair', college: 'BITS Pilani', returns: '+29.8%', portfolio: '₹12,98,200', avatar: '🐯', badge: '🥈', xp: 15980 },
  { rank: 3, name: 'Rahul Mehta', college: 'IIM Ahmedabad', returns: '+27.1%', portfolio: '₹12,71,000', avatar: '🦊', badge: '🥉', xp: 14250 },
  { rank: 4, name: 'Sneha Patel', college: 'SRCC Delhi', returns: '+24.5%', portfolio: '₹12,45,000', avatar: '🐺', badge: '⭐', xp: 12100 },
  { rank: 5, name: 'Karthik R', college: 'NIT Trichy', returns: '+22.3%', portfolio: '₹12,23,000', avatar: '🦅', badge: '⭐', xp: 10870 },
  { rank: 6, name: 'Ananya Singh', college: 'DU Commerce', returns: '+19.7%', portfolio: '₹11,97,000', avatar: '🦋', badge: '⭐', xp: 9340 },
  { rank: 7, name: 'Vikram Bose', college: 'VIT Vellore', returns: '+17.2%', portfolio: '₹11,72,000', avatar: '🐉', badge: '⭐', xp: 8120 },
  { rank: 8, name: 'You', college: 'Mumbai University', returns: '+12.4%', portfolio: '₹11,24,000', avatar: '🎯', badge: '⭐', xp: 4250, isUser: true },
];

export const AI_INSIGHTS = [
  { type: 'warning', icon: '⚠️', title: 'Overweight in IT', message: 'Your portfolio has 45% in IT sector. Consider diversifying to reduce sectoral risk.', action: 'Explore other sectors' },
  { type: 'success', icon: '✅', title: 'Great Entry on SBIN', message: 'You bought SBIN near support at ₹812 — textbook support bounce strategy!', action: 'Learn more' },
  { type: 'tip', icon: '💡', title: 'Market Timing Tip', message: 'Best buying opportunities in Nifty typically occur between 9:30-10:00 AM IST after the initial volatility settles.', action: 'Set alert' },
  { type: 'risk', icon: '🔴', title: 'High Volatility Detected', message: 'ADANIENT is showing high volatility. Your position is at 12% unrealized loss — consider stop-loss.', action: 'Set stop-loss' },
];

export function getUserRank(xp) {
  return RANKS.find(r => xp >= r.minXP && xp < r.maxXP) || RANKS[0];
}

export const PORTFOLIO_HOLDINGS = [
  { symbol: 'RELIANCE', shares: 5, avgPrice: 2780.00, currentPrice: 2847.30, sector: 'Energy' },
  { symbol: 'TCS', shares: 3, avgPrice: 3980.50, currentPrice: 3921.55, sector: 'IT' },
  { symbol: 'SBIN', shares: 20, avgPrice: 789.00, currentPrice: 812.65, sector: 'Finance' },
  { symbol: 'TITAN', shares: 2, avgPrice: 3280.00, currentPrice: 3412.70, sector: 'Consumer' },
  { symbol: 'INFY', shares: 10, avgPrice: 1590.00, currentPrice: 1543.20, sector: 'IT' },
];
