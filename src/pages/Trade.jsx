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

  const fetchUserDataAndQuotes = async () => {
    try {
      const [userRes, quotesRes] = await Promise.all([
        axios.get('/api/user'),
        axios.get('/api/markets/quotes')
      ]);
      setUserBalance(userRes.data.balance);
      setStocks(quotesRes.data.stocks);
      
      if (quotesRes.data.stocks.length > 0) {
        if (!stock) {
          setStock(quotesRes.data.stocks[0]);
        } else {
          // Keep current stock selected but update its live price
          const updated = quotesRes.data.stocks.find(s => s.symbol === stock.symbol);
          if (updated) {
            setStock(updated);
          }
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trade screen stats:', err);
    }
  };

  useEffect(() => {
    fetchUserDataAndQuotes();
    const interval = setInterval(fetchUserDataAndQuotes, 5000);
    return () => clearInterval(interval);
  }, [stock]);

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

      setUserBalance(res.data.user.balance);
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <div className="loading-spinner" style={{ fontSize: '1.25rem' }}>Loading Trade Terminal...</div>
      </div>
    );
  }

  return (
    <div className="trade-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trade <span className="text-gradient">Simulator</span></h1>
          <p className="page-sub">Practice trading with virtual money · Zero risk, real experience</p>
        </div>
        <div className="virtual-balance-pill">
          💰 Virtual Balance: <strong>₹{userBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>

      <div className="trade-layout">
        {/* Order Panel */}
        <div className="order-panel card">
          <div className="order-panel-header">
            <h2>Place Order</h2>
            <span className="badge badge-primary">NSE · Virtual</span>
          </div>

          {/* Buy / Sell Toggle */}
          <div className="side-toggle">
            <button
              id="buy-toggle-btn"
              className={`side-btn ${side === 'BUY' ? 'active buy' : ''}`}
              onClick={() => setSide('BUY')}
            >
              <TrendingUp size={16} /> BUY
            </button>
            <button
              id="sell-toggle-btn"
              className={`side-btn ${side === 'SELL' ? 'active sell' : ''}`}
              onClick={() => setSide('SELL')}
            >
              <TrendingDown size={16} /> SELL
            </button>
          </div>

          {/* Stock Selector */}
          <div className="form-group">
            <label className="form-label">Stock</label>
            <div className="stock-selector" onClick={() => setShowSearch(!showSearch)} id="stock-selector-btn">
              <div className="selected-stock-display">
                <span className="ss-symbol">{stock.symbol}</span>
                <span className="ss-price">₹{stock.price.toFixed(2)}</span>
                <span className={`ss-change ${stock.changePercent >= 0 ? 'up' : 'down'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  className="stock-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <input
                    id="trade-stock-search"
                    className="input"
                    placeholder="Search stock..."
                    value={searching}
                    onChange={e => setSearching(e.target.value)}
                    autoFocus
                  />
                  <div className="dropdown-list">
                    {filteredStocks.slice(0, 8).map(s => (
                      <div
                        key={s.symbol}
                        className="dropdown-item"
                        id={`select-${s.symbol}-btn`}
                        onClick={() => selectStock(s)}
                      >
                        <span className="dd-symbol">{s.symbol}</span>
                        <span className="dd-name">{s.name}</span>
                        <span className={`dd-change ${s.changePercent >= 0 ? 'up' : 'down'}`}>
                          ₹{s.price.toFixed(2)} ({s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    ))}
                    {filteredStocks.length === 0 && (
                      <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No stocks found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Product Type */}
          <div className="form-group">
            <label className="form-label">Product Type</label>
            <div className="toggle-group">
              {PRODUCT_TYPES.map(p => (
                <button
                  key={p}
                  id={`product-${p.toLowerCase()}-btn`}
                  className={`toggle-opt ${productType === p ? 'active' : ''}`}
                  onClick={() => setProductType(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Order Type */}
          <div className="form-group">
            <label className="form-label">Order Type</label>
            <div className="toggle-group">
              {ORDER_TYPES.map(o => (
                <button
                  key={o}
                  id={`order-type-${o.replace(' ', '-').toLowerCase()}-btn`}
                  className={`toggle-opt ${orderType === o ? 'active' : ''}`}
                  onClick={() => setOrderType(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} id="qty-minus-btn">−</button>
              <input
                id="qty-input"
                type="number"
                className="input qty-input"
                value={qty}
                min={1}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button className="qty-btn" onClick={() => setQty(qty + 1)} id="qty-plus-btn">+</button>
            </div>
          </div>

          {orderType !== 'Market' && (
            <div className="form-group">
              <label className="form-label">
                {orderType === 'Limit' ? 'Limit Price' : 'Stop Loss Price'}
              </label>
              <input
                id="limit-price-input"
                type="number"
                className="input"
                placeholder={`₹${stock.price.toFixed(2)}`}
                value={limitPrice}
                onChange={e => setLimitPrice(e.target.value)}
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-row">
              <span>LTP</span>
              <span className="font-mono">₹{stock.price.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Quantity</span>
              <span className="font-mono">{qty} shares</span>
            </div>
            <div className="summary-row">
              <span>Total Value</span>
              <span className="font-mono">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-row highlight">
              <span>Required Margin</span>
              <span className="font-mono">₹{margin.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <motion.button
            id="place-order-btn"
            className={`btn btn-lg w-full ${side === 'BUY' ? 'btn-primary' : 'btn-danger'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={placeOrder}
          >
            {side === 'BUY' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            Place {side} Order · {stock.symbol}
          </motion.button>

          {/* Messages Alerts (Confirmation Toasts) */}
          <AnimatePresence>
            {placed && (
              <motion.div
                className="order-confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <CheckCircle size={18} color="var(--brand-primary)" />
                <div>
                  <strong>Order Placed!</strong>
                  <span>{placed.side} {placed.qty} × {placed.symbol} @ ₹{placed.price.toFixed(2)}</span>
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

          {/* Quick Stats */}
          <div className="card trade-quick-stats">
            <h3 style={{ marginBottom: 16, fontSize: '0.95rem' }}>Today's P&L</h3>
            <div className="quick-stats-grid">
              {[
                { label: 'Trades Today', value: '4', icon: '⚡' },
                { label: 'Winning Trades', value: '3', icon: '✅' },
                { label: 'Today P&L', value: '+₹4,230', icon: '📈', isUp: true },
                { label: 'XP Earned Today', value: '+180 XP', icon: '⭐' },
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
