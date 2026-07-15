import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Search, Star, ChevronRight, Activity, X, ShieldCheck } from 'lucide-react';
import { NIFTY_STOCKS, generateChartData } from '../data/marketData';
import axios from 'axios';
import './Markets.css';

const SECTORS = ['All', 'IT', 'Finance', 'Energy', 'FMCG', 'Auto', 'Consumer'];

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

  // Trade Modal & User Balance State
  const [userBalance, setUserBalance] = useState(1000000);
  const [tradeModal, setTradeModal] = useState(null); // { side: 'BUY'|'SELL', stock: object } | null
  const [modalQty, setModalQty] = useState(1);
  const [tradeProductType, setTradeProductType] = useState('Delivery');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [tradeToast, setTradeToast] = useState(null);

  // Fetch live prices and set initial stock selection
  useEffect(() => {
    let isMounted = true;
    const fetchQuotes = async () => {
      try {
        const [quotesRes, userRes] = await Promise.all([
          axios.get('/api/markets/quotes'),
          axios.get('/api/user').catch(() => null)
        ]);

        if (!isMounted) return;
        setStocks(quotesRes.data.stocks);
        setMarketStatus(quotesRes.data.marketStatus);

        if (userRes && userRes.data) {
          setUserBalance(userRes.data.balance);
        }
        
        setSelectedStock(prev => {
          if (!prev) return quotesRes.data.stocks[0];
          const updated = quotesRes.data.stocks.find(s => s.symbol === prev.symbol);
          return updated || prev;
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching live quotes:', error);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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

  const openTradeModal = (side, stockToTrade) => {
    setTradeModal({ side, stock: stockToTrade || selectedStock });
    setModalQty(1);
    setTradeProductType('Delivery');
    setModalError('');
  };

  const handleExecuteModalOrder = async () => {
    if (!tradeModal || !tradeModal.stock || modalQty <= 0) return;
    setModalLoading(true);
    setModalError('');
    setTradeToast(null);

    try {
      const res = await axios.post('/api/trade', {
        symbol: tradeModal.stock.symbol,
        side: tradeModal.side,
        qty: modalQty,
        productType: tradeProductType
      });

      if (res.data && res.data.user) {
        setUserBalance(res.data.user.balance);
      }

      setTradeToast({
        type: 'success',
        text: `Successfully ${tradeModal.side === 'BUY' ? 'bought' : 'sold'} ${modalQty} share(s) of ${tradeModal.stock.symbol}!`
      });
      setTradeModal(null);
      setTimeout(() => setTradeToast(null), 5000);
    } catch (err) {
      console.error('Error executing trade:', err);
      const errMsg = err.response?.data?.error || 'Failed to execute order. Please check balance or holdings.';
      setModalError(errMsg);
    } finally {
      setModalLoading(false);
    }
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
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Live <span className="text-gradient">Markets</span></h1>
          <p className="page-sub">Explore NSE stocks, analyze charts, and place virtual orders</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {marketStatus && (
            <span className={`badge ${marketStatus.isOpen ? 'badge-primary' : 'badge-accent'}`}>
              <Activity size={12} style={{ marginRight: 4 }} />
              {marketStatus.isOpen ? 'NSE LIVE' : 'MARKET CLOSED'}
            </span>
          )}
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
            key={selectedStock.symbol}
            className="stock-detail-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header info */}
            <div className="detail-header card">
              <div>
                <div className="detail-symbol-row">
                  <h2 className="font-mono">{selectedStock.symbol}</h2>
                  <span className="stock-sector-badge">{selectedStock.sector}</span>
                </div>
                <p className="detail-name">{selectedStock.name}</p>
              </div>

              <div className="detail-price-wrap">
                <span className="detail-price font-mono">
                  ₹{selectedStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className={`detail-change ${selectedStock.changePercent >= 0 ? 'up' : 'down'}`}>
                  {selectedStock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(selectedStock.changePercent).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Price Chart */}
            <div className="chart-card card">
              <div className="chart-header">
                <h3>Price History (30 Days)</h3>
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

            {/* Trade Action Card with BUY and SELL Modal Trigger Buttons */}
            <div className="trade-action-card card">
              <div className="trade-action-header" style={{ marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Execute Order</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Virtual Balance: <strong style={{ color: 'var(--brand-primary)' }}>₹{userBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                  </span>
                </div>
                <span className="badge badge-primary">Virtual Trading</span>
              </div>

              <div className="trade-action-btns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <motion.button
                  className="btn btn-primary trade-buy-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openTradeModal('BUY', selectedStock)}
                  id={`buy-${selectedStock.symbol}-btn`}
                  style={{ padding: '12px', fontSize: '1rem' }}
                >
                  <TrendingUp size={18} />
                  BUY {selectedStock.symbol}
                </motion.button>
                <motion.button
                  className="btn btn-danger trade-sell-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openTradeModal('SELL', selectedStock)}
                  id={`sell-${selectedStock.symbol}-btn`}
                  style={{ padding: '12px', fontSize: '1rem' }}
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

      {/* Interactive Trade Execution Modal */}
      <AnimatePresence>
        {tradeModal?.open && tradeModal?.stock && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTradeModal(null)}
            style={{ zIndex: 1200 }}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 460 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Place Order: <span className="font-mono" style={{ color: 'var(--brand-primary)' }}>{tradeModal.stock.symbol}</span>
                </h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setTradeModal(null)}>
                  <X size={18} />
                </button>
              </div>

              {/* Side Selector Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 10, marginBottom: 20 }}>
                <button
                  type="button"
                  className={`btn ${tradeModal.side === 'BUY' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTradeModal({ ...tradeModal, side: 'BUY' })}
                >
                  <TrendingUp size={16} /> BUY
                </button>
                <button
                  type="button"
                  className={`btn ${tradeModal.side === 'SELL' ? 'btn-danger' : 'btn-ghost'}`}
                  onClick={() => setTradeModal({ ...tradeModal, side: 'SELL' })}
                >
                  <TrendingDown size={16} /> SELL
                </button>
              </div>

              {/* Order Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Product Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Delivery', 'Intraday'].map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`btn ${tradeProductType === type ? 'btn-secondary active' : 'btn-ghost'}`}
                        style={{ flex: 1, borderColor: tradeProductType === type ? 'var(--brand-primary)' : 'var(--border-color)' }}
                        onClick={() => setTradeProductType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Quantity (Shares)</label>
                  <div className="qty-control" style={{ width: '100%' }}>
                    <button type="button" className="qty-btn" onClick={() => setModalQty(Math.max(1, modalQty - 1))}>−</button>
                    <input
                      type="number"
                      className="input qty-input"
                      value={modalQty}
                      min={1}
                      onChange={e => setModalQty(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ textAlign: 'center', width: '100%' }}
                    />
                    <button type="button" className="qty-btn" onClick={() => setModalQty(modalQty + 1)}>+</button>
                  </div>
                </div>

                {/* Summary Box */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Market Price:</span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>₹{tradeModal.stock.price.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Estimated Total:</span>
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                      ₹{(tradeModal.stock.price * modalQty).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
                    <span>Available Cash:</span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      ₹{userBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {modalError && (
                  <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(255, 77, 109, 0.1)', border: '1px solid var(--brand-danger)', color: 'var(--brand-danger)', fontSize: '0.8rem' }}>
                    {modalError}
                  </div>
                )}

                <button
                  type="button"
                  className={`btn ${tradeModal.side === 'BUY' ? 'btn-primary' : 'btn-danger'} w-full btn-lg`}
                  onClick={handleExecuteModalOrder}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Executing Order...' : `Confirm ${tradeModal.side} Order`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
