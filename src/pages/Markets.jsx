import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Search, Filter, Star, ChevronRight, Activity } from 'lucide-react';
import { NIFTY_STOCKS, generateChartData } from '../data/marketData';
import './Markets.css';

const SECTORS = ['All', 'IT', 'Finance', 'Energy', 'FMCG', 'Auto', 'Consumer'];

import axios from 'axios';

export default function Markets() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [watchlist, setWatchlist] = useState(['RELIANCE', 'TCS', 'SBIN']);
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [marketStatus, setMarketStatus] = useState(null);
  const [quickQty, setQuickQty] = useState(1);
  const [tradeToast, setTradeToast] = useState(null);
  const [quickOrderLoading, setQuickOrderLoading] = useState(false);

  const handleQuickOrder = async (side) => {
    if (!selectedStock || quickQty <= 0) return;
    setQuickOrderLoading(true);
    setTradeToast(null);
    try {
      await axios.post('/api/trade', {
        symbol: selectedStock.symbol,
        side,
        qty: quickQty,
        productType: 'Delivery'
      });
      setTradeToast({
        type: 'success',
        text: `Successfully ${side === 'BUY' ? 'bought' : 'sold'} ${quickQty} share(s) of ${selectedStock.symbol}!`
      });
      setTimeout(() => setTradeToast(null), 5000);
    } catch (err) {
      console.error('Error placing quick order:', err);
      const errMsg = err.response?.data?.error || 'Failed to execute trade';
      setTradeToast({ type: 'error', text: errMsg });
      setTimeout(() => setTradeToast(null), 5000);
    } finally {
      setQuickOrderLoading(false);
    }
  };

  // Fetch live prices and set initial stock selection
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await axios.get('/api/markets/quotes');
        setStocks(res.data.stocks);
        setMarketStatus(res.data.marketStatus);
        if (loading) {
          setSelectedStock(res.data.stocks[0]);
          setLoading(false);
        } else if (selectedStock) {
          const updated = res.data.stocks.find(s => s.symbol === selectedStock.symbol);
          if (updated) {
            setSelectedStock(updated);
          }
        }
      } catch (error) {
        console.error('Error fetching live quotes:', error);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 5000);
    return () => clearInterval(interval);
  }, [selectedStock, loading]);

  // Fetch historical data whenever selected stock changes
  useEffect(() => {
    if (!selectedStock) return;

    const fetchHistorical = async () => {
      setChartLoading(true);
      try {
        const res = await axios.get(`/api/markets/historical/${selectedStock.symbol}`);
        setChartData(res.data);
      } catch (error) {
        console.error(`Error fetching historical for ${selectedStock.symbol}:`, error);
        setChartData(generateChartData(selectedStock.price, 30, 0.01));
      } finally {
        setChartLoading(false);
      }
    };

    fetchHistorical();
  }, [selectedStock?.symbol]);

  const filtered = stocks.filter(s =>
    (sector === 'All' || s.sector === sector) &&
    (s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleWatchlist = (symbol) => {
    setWatchlist(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const selectStock = (stock) => {
    setSelectedStock(stock);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <div className="loading-spinner" style={{ fontSize: '1.25rem' }}>Loading Live Markets...</div>
      </div>
    );
  }

  return (
    <div className="markets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Markets <span className="text-gradient">Live</span></h1>
          <p className="page-sub">NSE/BSE real-time simulation · Updated every 2.5s</p>
        </div>
        <div className="market-open-badge" style={{ borderColor: marketStatus?.isOpen ? 'var(--brand-primary)' : 'var(--brand-danger)', color: marketStatus?.isOpen ? 'var(--brand-primary)' : 'var(--brand-danger)' }}>
          <Activity size={14} />
          <span className="live-dot" style={{ background: marketStatus?.isOpen ? 'var(--brand-primary)' : 'var(--brand-danger)' }} />
          {marketStatus?.statusText || 'NSE LIVE'}
        </div>
      </div>

      <div className="markets-layout">
        {/* Stock List */}
        <div className="stock-list-panel card">
          {/* Search & Filter */}
          <div className="stock-list-controls">
            <div className="search-wrap">
              <Search size={16} color="var(--text-muted)" />
              <input
                id="stock-search-input"
                className="input search-input"
                placeholder="Search stocks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Sector Tabs */}
          <div className="sector-tabs">
            {SECTORS.map(s => (
              <button
                key={s}
                id={`sector-${s.toLowerCase()}-btn`}
                className={`sector-tab ${sector === s ? 'active' : ''}`}
                onClick={() => setSector(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Stock Rows */}
          <div className="stock-rows">
            <div className="stock-row-header">
              <span>Stock</span>
              <span>Price</span>
              <span>Change</span>
              <span></span>
            </div>
            {filtered.map(stock => {
              const isUp = stock.changePercent >= 0;
              const isSelected = selectedStock?.symbol === stock.symbol;
              const isWatched = watchlist.includes(stock.symbol);
              return (
                <motion.div
                  key={stock.symbol}
                  id={`stock-row-${stock.symbol}`}
                  className={`stock-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectStock(stock)}
                  whileHover={{ backgroundColor: 'rgba(0,245,160,0.03)' }}
                  layout
                >
                  <div className="stock-info">
                    <span className="stock-symbol">{stock.symbol}</span>
                    <span className="stock-name">{stock.name}</span>
                  </div>
                  <span className="stock-price font-mono">
                    ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`stock-change ${isUp ? 'up' : 'down'}`}>
                    {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                  <button
                    className={`btn btn-ghost btn-icon watchlist-btn ${isWatched ? 'watched' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                    id={`watchlist-${stock.symbol}-btn`}
                  >
                    <Star size={14} fill={isWatched ? 'var(--brand-gold)' : 'none'} color={isWatched ? 'var(--brand-gold)' : 'var(--text-muted)'} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chart + Detail Panel */}
        {selectedStock && (
          <motion.div
            className="stock-detail-panel"
            key={selectedStock.symbol}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card stock-header-card">
              <div className="stock-detail-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <h2 className="stock-detail-symbol">{selectedStock.symbol}</h2>
                    <span className="badge badge-primary">{selectedStock.sector}</span>
                  </div>
                  <p className="stock-detail-name">{selectedStock.name}</p>
                </div>
                <div className="stock-detail-price-block">
                  <span className="stock-detail-price">
                    ₹{selectedStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`stock-detail-change ${selectedStock.changePercent >= 0 ? 'up' : 'down'}`}>
                    {selectedStock.changePercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                    ({selectedStock.change >= 0 ? '+' : ''}₹{selectedStock.change.toFixed(2)})
                  </span>
                </div>
              </div>

              <div className="stock-meta-row">
                {[
                  { label: 'Volume', value: selectedStock.volume },
                  { label: 'Market Cap', value: selectedStock.marketCap },
                  { label: '52W High', value: `₹${(selectedStock.price * 1.32).toFixed(0)}` },
                  { label: '52W Low', value: `₹${(selectedStock.price * 0.72).toFixed(0)}` },
                  { label: 'P/E Ratio', value: '24.3' },
                  { label: 'Sector', value: selectedStock.sector },
                ].map(m => (
                  <div key={m.label} className="stock-meta-item">
                    <span className="meta-label">{m.label}</span>
                    <span className="meta-value">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="card chart-panel">
              <div className="card-header">
                <h3>Price Chart</h3>
                <div className="chart-period-tabs">
                  {['1D', '1W', '1M', '3M'].map(p => (
                    <button key={p} className={`period-tab ${p === '1M' ? 'active' : ''}`}>{p}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                {chartLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    Loading Yahoo Finance Chart...
                  </div>
                ) : (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedStock.changePercent >= 0 ? '#00f5a0' : '#ff4d6d'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={selectedStock.changePercent >= 0 ? '#00f5a0' : '#ff4d6d'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} interval={6} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v.toFixed(0)}`} width={65} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: 'var(--text-muted)' }}
                      itemStyle={{ color: selectedStock.changePercent >= 0 ? 'var(--brand-primary)' : 'var(--brand-danger)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={selectedStock.changePercent >= 0 ? '#00f5a0' : '#ff4d6d'}
                      strokeWidth={2}
                      fill="url(#stockGrad)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Trade Action */}
            <div className="trade-action-card card">
              <div className="trade-action-header">
                <h3>Quick Trade</h3>
                <span className="badge badge-primary">Virtual</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quantity:</label>
                <div className="qty-control" style={{ maxWidth: 130 }}>
                  <button className="qty-btn" onClick={() => setQuickQty(Math.max(1, quickQty - 1))}>−</button>
                  <input
                    type="number"
                    className="input qty-input"
                    value={quickQty}
                    min={1}
                    onChange={e => setQuickQty(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ textAlign: 'center', padding: '4px' }}
                  />
                  <button className="qty-btn" onClick={() => setQuickQty(quickQty + 1)}>+</button>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Total: ₹{(selectedStock.price * quickQty).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="trade-action-btns">
                <motion.button
                  className="btn btn-primary trade-buy-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={quickOrderLoading}
                  onClick={() => handleQuickOrder('BUY')}
                  id={`buy-${selectedStock.symbol}-btn`}
                >
                  <TrendingUp size={18} />
                  BUY {selectedStock.symbol}
                </motion.button>
                <motion.button
                  className="btn btn-danger trade-sell-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={quickOrderLoading}
                  onClick={() => handleQuickOrder('SELL')}
                  id={`sell-${selectedStock.symbol}-btn`}
                >
                  <TrendingDown size={18} />
                  SELL {selectedStock.symbol}
                </motion.button>
              </div>

              {tradeToast && (
                <div style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: tradeToast.type === 'success' ? 'rgba(0, 245, 160, 0.1)' : 'rgba(255, 77, 109, 0.1)',
                  border: `1px solid ${tradeToast.type === 'success' ? 'var(--brand-primary)' : 'var(--brand-danger)'}`,
                  color: tradeToast.type === 'success' ? 'var(--brand-primary)' : 'var(--brand-danger)'
                }}>
                  {tradeToast.text}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
