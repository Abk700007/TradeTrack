import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';
import './Trade.css';

const ORDER_TYPES = ['Market', 'Limit', 'Stop Loss'];
const PRODUCT_TYPES = ['Intraday', 'Delivery'];

export default function Trade() {
  const [side, setSide] = useState('BUY');
  const [stocks, setStocks] = useState([]);
  const [stock, setStock] = useState(null);
  const [userBalance, setUserBalance] = useState(1000000);
  const [loading, setLoading] = useState(true);

  const [qty, setQty] = useState(1);
  const [orderType, setOrderType] = useState('Market');
  const [productType, setProductType] = useState('Intraday');
  const [limitPrice, setLimitPrice] = useState('');
  const [placed, setPlaced] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [searching, setSearching] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // User Stats State
  const [userStats, setUserStats] = useState({
    xp: 0,
    holdingsCount: 0,
    totalPnL: 0,
    pnlPercent: '0.00'
  });

  const fetchUserDataAndQuotes = async () => {
    try {
      const [userRes, quotesRes, portRes] = await Promise.all([
        axios.get('/api/user').catch(() => null),
        axios.get('/api/markets/quotes'),
        axios.get('/api/portfolio').catch(() => null)
      ]);

      if (userRes && userRes.data) {
        setUserBalance(userRes.data.balance);
      }

      setStocks(quotesRes.data.stocks);

      setStock(prev => {
        if (!prev && quotesRes.data.stocks.length > 0) {
          return quotesRes.data.stocks[0];
        }
        if (prev) {
          const updated = quotesRes.data.stocks.find(s => s.symbol === prev.symbol);
          return updated || prev;
        }
        return null;
      });

      if (userRes?.data && portRes?.data) {
        const holdings = portRes.data.holdings || [];
        const totalValue = portRes.data.totalValue || 0;
        const invested = portRes.data.totalInvested || 0;
        const currentPnL = totalValue - invested;
        const pnlPct = invested > 0 ? ((currentPnL / invested) * 100).toFixed(2) : '0.00';

        setUserStats({
          xp: userRes.data.xp || 0,
          holdingsCount: holdings.length,
          totalPnL: currentPnL,
          pnlPercent: pnlPct
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching trade screen stats:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      await fetchUserDataAndQuotes();
    };

    loadAll();
    const interval = setInterval(fetchUserDataAndQuotes, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle stock change
  const selectStock = (s) => {
    setStock(s);
    setShowSearch(false);
    setSearching('');
  };

  const total = stock ? stock.price * qty : 0;
  const margin = productType === 'Intraday' ? total * 0.2 : total;

  const filteredStocks = stocks.filter(s =>
    s.symbol.toLowerCase().includes(searching.toLowerCase()) ||
    s.name.toLowerCase().includes(searching.toLowerCase())
  );

  const placeOrder = async () => {
    setErrorMsg('');
    setPlaced(null);
    try {
      const res = await axios.post('/api/trade', {
        symbol: stock.symbol,
        side,
        qty,
        productType
      });

      setPlaced({
        side,
        symbol: stock.symbol,
        qty,
        price: stock.price,
        total,
        orderType
      });

      if (res.data && res.data.user) {
        setUserBalance(res.data.user.balance);
      }

      // Refresh stats
      fetchUserDataAndQuotes();

      setTimeout(() => setPlaced(null), 5000);
    } catch (err) {
      console.error('Error placing order:', err);
      const msg = err.response?.data?.error || 'Failed to place order. Please try again.';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 6000);
    }
  };

  if (loading || !stock) {
    return (
      <div className="trade-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <div>Loading Trade Terminal...</div>
      </div>
    );
  }

  return (
    <div className="trade-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Trade <span className="text-gradient">Simulator</span></h1>
          <p className="page-sub">Practice trading with virtual money · Zero risk, real experience</p>
        </div>

        <div className="virtual-cash-badge">
          <span className="vc-label">💰 Virtual Balance:</span>
          <span className="vc-amount font-mono">₹{userBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div className="trade-layout">
        {/* Left Form */}
        <div className="trade-form-panel card">
          {/* Order Header: Buy / Sell toggle */}
          <div className="trade-side-tabs">
            <button
              id="trade-buy-tab"
              className={`side-tab buy ${side === 'BUY' ? 'active' : ''}`}
              onClick={() => setSide('BUY')}
            >
              <TrendingUp size={16} /> BUY
            </button>
            <button
              id="trade-sell-tab"
              className={`side-tab sell ${side === 'SELL' ? 'active' : ''}`}
              onClick={() => setSide('SELL')}
            >
              <TrendingDown size={16} /> SELL
            </button>
          </div>

          {/* Stock Selector Dropdown */}
          <div className="form-group relative">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>STOCK</label>
            <button
              className="stock-select-trigger"
              onClick={() => setShowSearch(!showSearch)}
              id="stock-selector-dropdown-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="font-mono font-bold" style={{ fontSize: '1rem' }}>{stock.symbol}</span>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <span className={`stock-change ${stock.changePercent >= 0 ? 'up' : 'down'}`}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </button>

            {showSearch && (
              <div className="stock-dropdown card">
                <input
                  type="text"
                  className="input search-input"
                  placeholder="Search stock symbol..."
                  value={searching}
                  onChange={e => setSearching(e.target.value)}
                  autoFocus
                  id="stock-search-field"
                />
                <div className="dropdown-list">
                  {filteredStocks.map(s => (
                    <div
                      key={s.symbol}
                      className="dropdown-item"
                      onClick={() => selectStock(s)}
                      id={`dropdown-stock-${s.symbol}`}
                    >
                      <div>
                        <span className="dropdown-symbol">{s.symbol}</span>
                        <span className="dropdown-name">{s.name}</span>
                      </div>
                      <span className="font-mono" style={{ fontSize: '0.85rem' }}>
                        ₹{s.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Type (Intraday vs Delivery) */}
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>PRODUCT TYPE</label>
            <div className="radio-pills">
              {PRODUCT_TYPES.map(p => (
                <button
                  key={p}
                  className={`radio-pill ${productType === p ? 'active' : ''}`}
                  onClick={() => setProductType(p)}
                  id={`product-type-${p.toLowerCase()}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Order Type */}
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>ORDER TYPE</label>
            <div className="radio-pills">
              {ORDER_TYPES.map(t => (
                <button
                  key={t}
                  className={`radio-pill ${orderType === t ? 'active' : ''}`}
                  onClick={() => setOrderType(t)}
                  id={`order-type-${t.toLowerCase().replace(' ', '-')}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>QUANTITY</label>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} id="qty-decrement-btn">−</button>
              <input
                type="number"
                className="input qty-input"
                value={qty}
                min={1}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                id="qty-input-field"
              />
              <button className="qty-btn" onClick={() => setQty(qty + 1)} id="qty-increment-btn">+</button>
            </div>
          </div>

          {/* Total & Margin Box */}
          <div className="order-summary-box">
            <div className="summary-row">
              <span className="summary-label">Estimated Value:</span>
              <span className="summary-val font-mono">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Margin Required ({productType === 'Intraday' ? '5x Leverage' : '1x Delivery'}):</span>
              <span className="summary-val font-mono" style={{ color: 'var(--brand-primary)' }}>
                ₹{margin.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className={`btn ${side === 'BUY' ? 'btn-primary' : 'btn-danger'} w-full btn-lg`}
            onClick={placeOrder}
            id="execute-trade-order-btn"
          >
            {side} {stock.symbol} ({qty} Shares)
          </button>

          {/* Confirmation Banners */}
          <AnimatePresence>
            {placed && (
              <motion.div
                className="order-confirm success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ backgroundColor: 'rgba(0, 245, 160, 0.12)', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <CheckCircle size={18} color="var(--brand-primary)" />
                <div>
                  <strong>Order Executed!</strong>
                  <span>Placed {placed.side} order for {placed.qty} x {placed.symbol} at ₹{placed.price.toFixed(2)}</span>
                </div>
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                className="order-confirm error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ backgroundColor: 'rgba(255, 77, 109, 0.12)', border: '1px solid var(--brand-danger)', color: 'var(--brand-danger)', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <AlertCircle size={18} color="var(--brand-danger)" />
                <div>
                  <strong>Order Failed</strong>
                  <span>{errorMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Stock Info + AI Tip */}
        <div className="trade-right">
          {/* Stock Overview */}
          <div className="card trade-stock-overview">
            <div className="tso-header">
              <div>
                <h2 className="font-mono">{stock.symbol}</h2>
                <p className="tso-name">{stock.name}</p>
              </div>
              <div className="tso-price-block">
                <span className="tso-price">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className={`tso-change ${stock.changePercent >= 0 ? 'up' : 'down'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="tso-stats">
              {[
                { label: 'Volume', value: stock.volume },
                { label: 'Market Cap', value: stock.marketCap },
                { label: 'Sector', value: stock.sector },
              ].map(s => (
                <div key={s.label} className="tso-stat">
                  <span className="tso-stat-label">{s.label}</span>
                  <span className="tso-stat-value">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Coach Tip */}
          <div className="card ai-trade-tip">
            <div className="ai-tip-header">
              <span className="ai-badge">🤖 AI Coach</span>
            </div>
            <div className="ai-tip-content">
              <p className="ai-tip-text">
                <strong>{stock.symbol}</strong> is currently trading near its 20-day moving average.
                {stock.changePercent >= 0
                  ? ' Momentum is positive — watch for breakout above recent highs.'
                  : ' Consider waiting for stabilization before entering a position.'}
              </p>
              <div className="ai-tip-disclamer">
                <Info size={12} />
                Educational insight only. Not financial advice.
              </div>
            </div>
          </div>

          {/* Quick Stats - 100% Dynamic from User Account & Portfolio */}
          <div className="card trade-quick-stats">
            <h3 style={{ marginBottom: 16, fontSize: '0.95rem' }}>Portfolio Overview</h3>
            <div className="quick-stats-grid">
              {[
                { label: 'Holdings Count', value: `${userStats.holdingsCount} Positions`, icon: '⚡' },
                { label: 'Total P&L', value: `${userStats.totalPnL >= 0 ? '+' : ''}₹${Math.abs(userStats.totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: '📈', isUp: userStats.totalPnL >= 0 },
                { label: 'Return %', value: `${userStats.pnlPercent}%`, icon: '✅', isUp: parseFloat(userStats.pnlPercent) >= 0 },
                { label: 'Account XP', value: `+${userStats.xp} XP`, icon: '⭐' },
              ].map(s => (
                <div key={s.label} className="quick-stat-item">
                  <span className="qs-icon">{s.icon}</span>
                  <span className={`qs-value ${s.isUp ? 'up' : ''}`}>{s.value}</span>
                  <span className="qs-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
