import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart2, Target, Award, X, Zap, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateChartData } from '../data/marketData';
import axios from 'axios';
import './Portfolio.css';

const PIE_COLORS = ['#00f5a0', '#00d9f5', '#7c3aed', '#ff4d6d', '#ffbe0b'];
const DEFAULT_SECTOR_DATA = [
  { name: 'Finance', value: 35 }, { name: 'IT', value: 30 },
  { name: 'Energy', value: 20 }, { name: 'Consumer', value: 10 }, { name: 'Auto', value: 5 },
];

export default function Portfolio() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trade History Filter & Pagination states
  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState('ALL'); // 'ALL' | 'BUY' | 'SELL'
  const [txPage, setTxPage] = useState(1);

  // Trade Modal states
  const [selectedHoldingModal, setSelectedHoldingModal] = useState(null);
  const [tradeSide, setTradeSide] = useState('BUY');
  const [tradeQty, setTradeQty] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = txFilter === 'ALL' || t.side === txFilter;
    const matchesSearch = t.symbol.toLowerCase().includes(txSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = filteredTransactions.slice((txPage - 1) * ITEMS_PER_PAGE, txPage * ITEMS_PER_PAGE);

  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) return;
    const headers = ['Symbol', 'Side', 'Quantity', 'Price (INR)', 'Date', 'Total (INR)', 'Product Type'];
    const rows = transactions.map(t => [
      t.symbol,
      t.side,
      t.qty,
      t.price,
      new Date(t.date).toISOString().split('T')[0],
      t.total,
      t.productType
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TradeTrack_Trade_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openTradeModal = (holding) => {
    setSelectedHoldingModal(holding);
    setTradeSide('BUY');
    setTradeQty(1);
    setModalError('');
  };

  const handleExecuteTrade = async () => {
    if (!selectedHoldingModal) return;
    setModalError('');

    const qty = parseInt(tradeQty);
    if (isNaN(qty) || qty <= 0) {
      setModalError('Quantity must be a positive number greater than zero.');
      return;
    }

    if (tradeSide === 'SELL' && qty > selectedHoldingModal.shares) {
      setModalError(`Cannot sell ${qty} shares. You only own ${selectedHoldingModal.shares} shares of ${selectedHoldingModal.symbol}.`);
      return;
    }

    setModalLoading(true);
    try {
      await axios.post('/api/trade', {
        symbol: selectedHoldingModal.symbol,
        side: tradeSide,
        qty,
        productType: 'Delivery'
      });
      setSelectedHoldingModal(null);
      await fetchData();
    } catch (err) {
      console.error('Error executing trade from modal:', err);
      setModalError(err.response?.data?.error || 'Trade failed. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [portRes, txRes] = await Promise.all([
        axios.get('/api/portfolio'),
        axios.get('/api/portfolio/transactions')
      ]);
      setPortfolioData(portRes.data);
      setTransactions(txRes.data);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickSell = async (symbol, sharesToSell) => {
    try {
      await axios.post('/api/trade', {
        symbol,
        side: 'SELL',
        qty: sharesToSell,
        productType: 'Delivery'
      });
      await fetchData();
    } catch (err) {
      console.error('Error executing quick sell:', err);
      alert(err.response?.data?.error || 'Failed to sell holding');
    }
  };

  const totalValue = portfolioData?.totalValue || 0;
  const totalInvested = portfolioData?.totalInvested || 0;
  const totalPnL = portfolioData?.totalPnL || 0;
  const pnlPct = portfolioData?.pnlPct || '0.00';
  const holdings = portfolioData?.holdings || [];
  const sectorData = portfolioData?.sectorAllocation && portfolioData.sectorAllocation.length > 0
    ? portfolioData.sectorAllocation
    : [];

  const chartData = generateChartData(totalValue > 0 ? totalValue : 1000000, 60, 0.015);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <div className="loading-spinner" style={{ fontSize: '1.25rem' }}>Loading Portfolio Details...</div>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My <span className="text-gradient">Portfolio</span></h1>
          <p className="page-sub">Track, analyze and optimize your virtual investments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="portfolio-summary-grid">
        {[
          { label: 'Portfolio Value', value: `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: '💼', color: 'var(--brand-primary)' },
          { label: 'Total Invested', value: `₹${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: '💰', color: 'var(--brand-secondary)' },
          { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}₹${Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: totalPnL >= 0 ? '📈' : '📉', color: totalPnL >= 0 ? 'var(--brand-primary)' : 'var(--brand-danger)', isUp: totalPnL >= 0 },
          { label: 'Returns', value: `${pnlPct >= 0 ? '+' : ''}${pnlPct}%`, icon: '🎯', color: totalPnL >= 0 ? 'var(--brand-primary)' : 'var(--brand-danger)' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="card port-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className="port-stat-icon">{s.icon}</span>
            <span className="port-stat-label">{s.label}</span>
            <span className="port-stat-value" style={{ color: s.color }}>{s.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="portfolio-charts-row">
        {/* Performance Chart */}
        <motion.div
          className="card perf-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <h3>Performance History</h3>
            <div className="chart-period-tabs">
              {['1M', '3M', '6M', 'ALL'].map(p => (
                <button key={p} className={`period-tab ${p === '1M' ? 'active' : ''}`}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="portGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00f5a0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} interval={10} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/100000).toFixed(1)}L`} width={40} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#00f5a0" strokeWidth={2} fill="url(#portGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Allocation */}
        <motion.div
          className="card allocation-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Sector Allocation</h3>
          {sectorData.length > 0 ? (
            <div className="allocation-content">
              <PieChart width={150} height={150}>
                <Pie data={sectorData} cx={70} cy={70} innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                  {sectorData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="alloc-legend">
                {sectorData.map((s, i) => (
                  <div key={s.name} className="alloc-item">
                    <span className="alloc-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="alloc-name">{s.name}</span>
                    <div className="alloc-bar-wrap">
                      <div className="alloc-bar">
                        <div className="alloc-fill" style={{ width: `${s.value}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      </div>
                      <span className="alloc-pct">{s.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No active stock holdings to calculate sector allocation.
            </div>
          )}
        </motion.div>
      </div>

      {/* Holdings Table */}
      <motion.div
        className="card holdings-full-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="card-header">
          <h3>Holdings</h3>
          <span className="badge badge-primary">{holdings.length} stocks</span>
        </div>
        <div className="full-holdings-table">
          <div className="fh-header">
            <span>Stock</span><span>Sector</span><span>Qty</span>
            <span>Avg Price</span><span>LTP</span><span>Invested</span>
            <span>Current Value</span><span>P&L</span><span>Returns</span>
            <span>Action</span>
          </div>
          {holdings.map(h => {
            const pl = h.pnl;
            const plPct = ((h.currentPrice - h.avgPrice) / h.avgPrice * 100).toFixed(2);
            const isUp = pl >= 0;
            return (
              <motion.div
                key={h.symbol}
                className="fh-row"
                whileHover={{ backgroundColor: 'rgba(0,245,160,0.025)' }}
              >
                <span className="fh-symbol font-mono">{h.symbol}</span>
                <span><span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{h.sector}</span></span>
                <span className="fh-cell">{h.shares}</span>
                <span className="fh-cell font-mono">₹{h.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="fh-cell font-mono">₹{h.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="fh-cell font-mono">₹{h.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="fh-cell font-mono">₹{h.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className={`fh-pnl ${isUp ? 'up' : 'down'}`}>
                  {isUp ? '+' : ''}₹{Math.abs(pl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className={`fh-pct ${isUp ? 'up' : 'down'}`}>
                  {isUp ? '+' : ''}{plPct}%
                </span>
                <div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={() => openTradeModal(h)}
                  >
                    <Zap size={13} /> Buy / Sell
                  </button>
                </div>
              </motion.div>
            );
          })}
          {holdings.length === 0 && (
            <div style={{ gridColumn: 'span 10', textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              No active holdings found. Try purchasing stocks on the <a href="/trade" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>Trade page</a>!
            </div>
          )}
        </div>
      </motion.div>

      {/* Trade History */}
      <motion.div
        className="card trade-hist-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3>Trade History</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Audit log of all executed orders ({filteredTransactions.length} total)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="search-wrap" style={{ maxWidth: 180, padding: '4px 10px' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search stock..."
                value={txSearch}
                onChange={e => { setTxSearch(e.target.value); setTxPage(1); }}
                style={{ fontSize: '0.8rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%' }}
              />
            </div>

            {/* Side Filter Pills */}
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 8, padding: 3 }}>
              {['ALL', 'BUY', 'SELL'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => { setTxFilter(f); setTxPage(1); }}
                  style={{
                    border: 'none',
                    background: txFilter === f ? (f === 'BUY' ? 'var(--brand-primary)' : f === 'SELL' ? 'var(--brand-danger)' : 'rgba(255,255,255,0.15)') : 'transparent',
                    color: txFilter === f ? (f === 'BUY' ? '#000' : '#fff') : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Export CSV Button */}
            <button className="btn btn-secondary btn-sm" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        <div className="th-table">
          <div className="th-header">
            <span>Symbol</span><span>Side</span><span>Qty</span>
            <span>Price</span><span>Date</span><span>Total Value</span><span>Product</span>
          </div>
          {paginatedTransactions.map((t, i) => (
            <div key={i} className="th-row">
              <span className="font-mono th-sym">{t.symbol}</span>
              <span className={`th-side ${t.side === 'BUY' ? 'buy' : 'sell'}`}>{t.side}</span>
              <span className="th-cell">{t.qty}</span>
              <span className="th-cell font-mono">₹{t.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span className="th-cell">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              <span className="th-cell font-mono">₹{t.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              <span className={`th-status ${t.productType.toLowerCase()}`}>{t.productType}</span>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div style={{ gridColumn: 'span 7', textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              No transactions match your search filter.
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
            marginTop: 12
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Page <strong>{txPage}</strong> of <strong>{totalPages}</strong> ({filteredTransactions.length} trades)
            </span>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={txPage === 1}
                onClick={() => setTxPage(p => Math.max(1, p - 1))}
                style={{ opacity: txPage === 1 ? 0.4 : 1, cursor: txPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                className="btn btn-ghost btn-sm"
                disabled={txPage === totalPages}
                onClick={() => setTxPage(p => Math.min(totalPages, p + 1))}
                style={{ opacity: txPage === totalPages ? 0.4 : 1, cursor: txPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* BUY / SELL TRADE MODAL */}
      <AnimatePresence>
        {selectedHoldingModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedHoldingModal(null)}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedHoldingModal(null)}>
                <X size={18} />
              </button>

              <div className="card-header" style={{ marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    Trade {selectedHoldingModal.symbol}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedHoldingModal.name} · <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{selectedHoldingModal.sector}</span>
                  </span>
                </div>
              </div>

              {/* Holding Info Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                background: 'rgba(255,255,255,0.03)',
                padding: '12px',
                borderRadius: 10,
                marginBottom: 16,
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LTP</div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    ₹{selectedHoldingModal.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Shares Owned</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--brand-primary)' }}>
                    {selectedHoldingModal.shares}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avg Price</div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    ₹{selectedHoldingModal.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Side Selector Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <button
                  type="button"
                  className={`btn ${tradeSide === 'BUY' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    background: tradeSide === 'BUY' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                    color: tradeSide === 'BUY' ? '#000' : 'var(--text-primary)'
                  }}
                  onClick={() => { setTradeSide('BUY'); setModalError(''); }}
                >
                  <TrendingUp size={16} /> BUY
                </button>
                <button
                  type="button"
                  className={`btn ${tradeSide === 'SELL' ? 'btn-danger' : 'btn-ghost'}`}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    background: tradeSide === 'SELL' ? 'var(--brand-danger)' : 'rgba(255,255,255,0.05)',
                    color: tradeSide === 'SELL' ? '#fff' : 'var(--text-primary)'
                  }}
                  onClick={() => { setTradeSide('SELL'); setModalError(''); }}
                >
                  <TrendingDown size={16} /> SELL
                </button>
              </div>

              {/* Quantity Input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Shares Quantity {tradeSide === 'SELL' && `(Max: ${selectedHoldingModal.shares})`}
                </label>
                <div className="qty-control" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="qty-btn"
                    style={{ width: 36, height: 36, fontSize: '1.2rem', borderRadius: 8 }}
                    onClick={() => setTradeQty(Math.max(1, tradeQty - 1))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="input qty-input"
                    value={tradeQty}
                    min={1}
                    max={tradeSide === 'SELL' ? selectedHoldingModal.shares : undefined}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val) || val < 1) {
                        setTradeQty(1);
                      } else {
                        setTradeQty(val);
                      }
                      setModalError('');
                    }}
                    style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem', flex: 1, padding: '8px' }}
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    style={{ width: 36, height: 36, fontSize: '1.2rem', borderRadius: 8 }}
                    onClick={() => {
                      if (tradeSide === 'SELL' && tradeQty >= selectedHoldingModal.shares) return;
                      setTradeQty(tradeQty + 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Estimated Cost */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: '0.85rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Total:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: tradeSide === 'BUY' ? 'var(--brand-primary)' : 'var(--brand-danger)' }}>
                  ₹{(selectedHoldingModal.currentPrice * tradeQty).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {modalError && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(255, 77, 109, 0.12)',
                  border: '1px solid var(--brand-danger)',
                  color: 'var(--brand-danger)',
                  fontSize: '0.8rem',
                  marginBottom: 16
                }}>
                  {modalError}
                </div>
              )}

              {/* Action Buttons */}
              <button
                type="button"
                className={`btn ${tradeSide === 'BUY' ? 'btn-primary' : 'btn-danger'} w-full btn-lg`}
                disabled={modalLoading}
                onClick={handleExecuteTrade}
              >
                {modalLoading ? 'Executing Order...' : `Confirm ${tradeSide} (${tradeQty} share${tradeQty > 1 ? 's' : ''})`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
