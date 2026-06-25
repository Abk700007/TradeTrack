import express from 'express';
import axios from 'axios';

const router = express.Router();

export const STOCK_MAPPINGS = {
  'RELIANCE': { name: 'Reliance Industries', sector: 'Energy', ticker: 'RELIANCE.NS', defaultPrice: 1323.10 },
  'TCS': { name: 'Tata Consultancy Services', sector: 'IT', ticker: 'TCS.NS', defaultPrice: 3921.55 },
  'HDFCBANK': { name: 'HDFC Bank', sector: 'Finance', ticker: 'HDFCBANK.NS', defaultPrice: 1678.90 },
  'INFY': { name: 'Infosys', sector: 'IT', ticker: 'INFY.NS', defaultPrice: 1543.20 },
  'ICICIBANK': { name: 'ICICI Bank', sector: 'Finance', ticker: 'ICICIBANK.NS', defaultPrice: 1089.45 },
  'HINDUNILVR': { name: 'Hindustan Unilever', sector: 'FMCG', ticker: 'HINDUNILVR.NS', defaultPrice: 2234.80 },
  'SBIN': { name: 'State Bank of India', sector: 'Finance', ticker: 'SBIN.NS', defaultPrice: 812.65 },
  'BAJFINANCE': { name: 'Bajaj Finance', sector: 'Finance', ticker: 'BAJFINANCE.NS', defaultPrice: 7234.50 },
  'WIPRO': { name: 'Wipro', sector: 'IT', ticker: 'WIPRO.NS', defaultPrice: 467.85 },
  'TITAN': { name: 'Titan Company', sector: 'Consumer', ticker: 'TITAN.NS', defaultPrice: 3412.70 },
  'ADANIENT': { name: 'Adani Enterprises', sector: 'Diversified', ticker: 'ADANIENT.NS', defaultPrice: 2678.40 },
  'MARUTI': { name: 'Maruti Suzuki', sector: 'Auto', ticker: 'MARUTI.NS', defaultPrice: 12456.30 },
  'ASIANPAINT': { name: 'Asian Paints', sector: 'Consumer', ticker: 'ASIANPAINT.NS', defaultPrice: 2891.60 },
  'ONGC': { name: 'Oil & Natural Gas Corp', sector: 'Energy', ticker: 'ONGC.NS', defaultPrice: 267.45 },
  'TATAMOTORS': { name: 'Tata Motors', sector: 'Auto', ticker: 'TATAMOTORS.NS', defaultPrice: 987.30 }
};

const INDEX_MAPPINGS = [
  { name: 'NIFTY 50', ticker: '^NSEI', defaultVal: '24,198.35' },
  { name: 'SENSEX', ticker: '^BSESN', defaultVal: '79,576.12' },
  { name: 'NIFTY BANK', ticker: '^NSEBANK', defaultVal: '51,834.70' },
  { name: 'NIFTY IT', ticker: '^CNXIT', defaultVal: '38,234.85' },
  { name: 'NIFTY MIDCAP', ticker: '^NSEMDCP50', defaultVal: '56,123.45' }
];

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Persistent in-memory cache for live stock data
let priceCache = {
  timestamp: 0,
  stocks: [],
  indices: [],
  map: {}
};

const CACHE_DURATION_MS = 10000; // 10 seconds

export function getMarketStatus() {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const totalMinutesUTC = utcHours * 60 + utcMinutes;
  const dayOfWeek = now.getUTCDay(); // 0 = Sun, 6 = Sat

  // IST 09:15 AM = 03:45 AM UTC (225 minutes)
  // IST 03:30 PM = 10:00 AM UTC (600 minutes)
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isTradingHours = totalMinutesUTC >= 225 && totalMinutesUTC <= 600;
  const isOpen = isWeekday && isTradingHours;

  return {
    isOpen,
    statusText: isOpen ? 'NSE OPEN' : 'NSE CLOSED',
    remainingText: isOpen ? 'Trading session active' : 'Market reopens 09:15 AM IST'
  };
}

export async function fetchStockChartData(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1mo`;
    const res = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
    const result = res.data?.chart?.result?.[0];
    return result || null;
  } catch (err) {
    console.error(`Direct Yahoo fetch failed for ${ticker}:`, err.message);
    return null;
  }
}

export async function getLatestStockPrice(symbol) {
  // Check if we have a valid cached price
  if (priceCache.map[symbol] && priceCache.map[symbol].price > 0) {
    // If cache is less than 30s old, return immediately
    if (Date.now() - priceCache.timestamp < 30000) {
      return priceCache.map[symbol].price;
    }
  }

  const info = STOCK_MAPPINGS[symbol];
  if (!info) return 1000;

  const result = await fetchStockChartData(info.ticker);
  if (result && result.meta && result.meta.regularMarketPrice) {
    const price = parseFloat(result.meta.regularMarketPrice.toFixed(2));
    // Update cache map entry
    priceCache.map[symbol] = {
      price,
      change: result.meta.regularMarketPrice - (result.meta.chartPreviousClose || result.meta.regularMarketPrice),
      changePercent: ((result.meta.regularMarketPrice - (result.meta.chartPreviousClose || result.meta.regularMarketPrice)) / (result.meta.chartPreviousClose || result.meta.regularMarketPrice)) * 100
    };
    return price;
  }

  // Fallback to cache or defaultPrice
  return priceCache.map[symbol]?.price || info.defaultPrice;
}

async function updateLiveQuotesCache() {
  const now = Date.now();
  if (now - priceCache.timestamp < CACHE_DURATION_MS && priceCache.stocks.length > 0) {
    return priceCache;
  }

  // Fetch stocks in parallel
  const stockPromises = Object.entries(STOCK_MAPPINGS).map(async ([symbol, info]) => {
    const chart = await fetchStockChartData(info.ticker);
    let price = info.defaultPrice;
    let change = 0;
    let changePercent = 0;
    let volume = '5.2M';
    let marketCap = '5.0L Cr';

    if (chart && chart.meta) {
      price = parseFloat((chart.meta.regularMarketPrice || info.defaultPrice).toFixed(2));
      const prevClose = chart.meta.chartPreviousClose || price;
      change = parseFloat((price - prevClose).toFixed(2));
      changePercent = parseFloat(((change / prevClose) * 100).toFixed(2));
      volume = formatVolume(chart.meta.regularMarketVolume);
    } else if (priceCache.map[symbol]) {
      // Fallback to previous cache
      price = priceCache.map[symbol].price;
      change = priceCache.map[symbol].change || 0;
      changePercent = priceCache.map[symbol].changePercent || 0;
    }

    priceCache.map[symbol] = { price, change, changePercent };

    return {
      symbol,
      name: info.name,
      price,
      change,
      changePercent,
      volume,
      sector: info.sector,
      marketCap
    };
  });

  // Fetch indices in parallel
  const indexPromises = INDEX_MAPPINGS.map(async (idx) => {
    const chart = await fetchStockChartData(idx.ticker);
    let val = idx.defaultVal;
    let change = '+0.00';
    let changePercent = '+0.00%';
    let isUp = true;

    if (chart && chart.meta) {
      const price = chart.meta.regularMarketPrice || 0;
      const prevClose = chart.meta.chartPreviousClose || price;
      const diff = price - prevClose;
      const diffPct = (diff / prevClose) * 100;
      val = price.toLocaleString('en-IN', { maximumFractionDigits: 2 });
      change = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`;
      changePercent = `${diff >= 0 ? '+' : ''}${diffPct.toFixed(2)}%`;
      isUp = diff >= 0;
    }

    return {
      name: idx.name,
      value: val,
      change,
      changePercent,
      isUp
    };
  });

  const stocks = await Promise.all(stockPromises);
  const indices = await Promise.all(indexPromises);

  priceCache = {
    timestamp: now,
    stocks,
    indices,
    map: priceCache.map
  };

  return priceCache;
}

function formatVolume(vol) {
  if (!vol) return '5.2M';
  if (vol >= 1e7) return `${(vol / 1e7).toFixed(1)}Cr`;
  if (vol >= 1e5) return `${(vol / 1e5).toFixed(1)}L`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return vol.toString();
}

// GET live quotes, indices, and market status
router.get('/quotes', async (req, res) => {
  try {
    const data = await updateLiveQuotesCache();
    const marketStatus = getMarketStatus();
    res.json({
      ...data,
      marketStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET historical data for charting
router.get('/historical/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const info = STOCK_MAPPINGS[symbol];
  if (!info) {
    return res.status(404).json({ error: 'Stock symbol not found' });
  }

  try {
    const chart = await fetchStockChartData(info.ticker);
    if (!chart || !chart.timestamp || !chart.indicators?.quote?.[0]?.close) {
      throw new Error('No historical timestamps returned');
    }

    const timestamps = chart.timestamp;
    const closes = chart.indicators.quote[0].close;
    const opens = chart.indicators.quote[0].open || closes;
    const highs = chart.indicators.quote[0].high || closes;
    const lows = chart.indicators.quote[0].low || closes;

    const chartData = timestamps.map((ts, i) => {
      const close = closes[i] || info.defaultPrice;
      return {
        date: new Date(ts * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        open: parseFloat((opens[i] || close).toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        high: parseFloat((highs[i] || close).toFixed(2)),
        low: parseFloat((lows[i] || close).toFixed(2)),
        value: parseFloat(close.toFixed(2))
      };
    });

    res.json(chartData);
  } catch (error) {
    console.error(`Error fetching historical for ${symbol}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
