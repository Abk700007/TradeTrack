import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { NIFTY_STOCKS, MARKET_INDICES } from '../data/marketData';
import './TickerTape.css';

function TickerItem({ symbol, price, change, changePercent, isUp }) {
  return (
    <div className="ticker-item">
      <span className="ticker-symbol">{symbol}</span>
      <span className="ticker-price">₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      <span className={`ticker-change ${isUp ? 'up' : 'down'}`}>
        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
      </span>
    </div>
  );
}

export default function TickerTape() {
  const [prices, setPrices] = useState(NIFTY_STOCKS);
  const [marketStatus, setMarketStatus] = useState('OPEN');

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(stock => {
        const delta = (Math.random() - 0.49) * stock.price * 0.003;
        const newPrice = parseFloat((stock.price + delta).toFixed(2));
        const newChange = parseFloat((newPrice - (stock.price - stock.change)).toFixed(2));
        const newChangePercent = parseFloat(((newChange / (stock.price - stock.change)) * 100).toFixed(2));
        return { ...stock, price: newPrice, change: newChange, changePercent: newChangePercent };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const allItems = [...prices, ...prices]; // duplicate for seamless loop

  return (
    <div className="ticker-tape-container">
      {/* Market Status */}
      <div className="market-status-bar">
        <div className="market-indices">
          {MARKET_INDICES.map(idx => (
            <div key={idx.name} className="index-item">
              <span className="index-name">{idx.name}</span>
              <span className="index-value">{idx.value}</span>
              <span className={`index-change ${idx.isUp ? 'up' : 'down'}`}>
                {idx.change} ({idx.changePercent})
              </span>
            </div>
          ))}
        </div>
        <div className="market-live-indicator">
          <Activity size={12} />
          <span className="live-dot" />
          <span>NSE/BSE LIVE</span>
        </div>
      </div>

      {/* Scrolling Ticker */}
      <div className="ticker-container">
        <div className="ticker-label">
          <span>STOCKS</span>
        </div>
        <div className="ticker-scroll-wrap">
          <div className="ticker-tape">
            {allItems.map((stock, i) => (
              <TickerItem
                key={`${stock.symbol}-${i}`}
                symbol={stock.symbol}
                price={stock.price}
                change={stock.change}
                changePercent={stock.changePercent}
                isUp={stock.changePercent >= 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
