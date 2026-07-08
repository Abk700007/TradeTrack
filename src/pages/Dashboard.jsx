import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, Flame, Zap, Trophy, Target,
  ChevronRight, Star, CheckCircle, Circle, ArrowUpRight,
  Brain, Bell, Swords
} from 'lucide-react';
import {
  generateChartData, DAILY_CHALLENGES, ACHIEVEMENTS,
  AI_INSIGHTS, getUserRank, PORTFOLIO_HOLDINGS
} from '../data/marketData';
import './Dashboard.css';

const PORTFOLIO_VALUE = 1124000;
const INVESTED = 980000;
const PNL = PORTFOLIO_VALUE - INVESTED;
const PNL_PERCENT = ((PNL / INVESTED) * 100).toFixed(2);
const USER_XP = 4250;
const STREAK = 7;

const portfolioChartData = generateChartData(1000000, 30, 0.015);

const PIE_COLORS = ['#00f5a0', '#00d9f5', '#7c3aed', '#ff4d6d', '#ffbe0b'];
const SECTOR_DATA = [
  { name: 'Finance', value: 35 },
  { name: 'IT', value: 30 },
  { name: 'Energy', value: 20 },
  { name: 'Consumer', value: 10 },
  { name: 'Auto', value: 5 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

function StatCard({ label, value, sub, isUp, icon, accent }) {
  return (
    <motion.div variants={itemVariants} className={`stat-card ${accent ? 'accent' : ''}`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon">{icon}</div>
      </div>
      <div className="stat-card-value">{value}</div>
      {sub && (
        <div className={`stat-card-sub ${isUp ? 'up' : 'down'}`}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {sub}
        </div>
      )}
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-date">{label}</div>
        <div className="tooltip-value">₹{payload[0].value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
      </div>
    );
  }
  return null;
}

import axios from 'axios';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [marketStatus, setMarketStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, portRes, lbRes, mktRes] = await Promise.all([
          axios.get('/api/user'),
          axios.get('/api/portfolio'),
          axios.get('/api/leaderboard'),
          axios.get('/api/markets/quotes')
        ]);
        setUserData(userRes.data);
        setPortfolioData(portRes.data);
        setLeaderboardData(lbRes.data);
        setMarketStatus(mktRes.data.marketStatus);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedChallenges = userData?.completedChallenges || [2, 4];
  const userXP = userData?.xp || 0;
  const streak = userData?.streak || 1;
  const rank = getUserRank(userXP);
  const nextRank = { minXP: 5000 };
  const xpToNext = nextRank.minXP - userXP;
  const xpProgress = Math.min(100, Math.max(5, (userXP / 5000) * 100));

  const userBalance = userData?.balance || 1000000;
  const holdingsValue = portfolioData?.totalValue || 0;
  const netWorth = userBalance + holdingsValue;
  const totalPnL = portfolioData?.totalPnL || 0;
  const pnlPercent = portfolioData?.pnlPct || '0.00';
  const holdings = portfolioData?.holdings || [];
  const sectorData = portfolioData?.sectorAllocation && portfolioData.sectorAllocation.length > 0
    ? portfolioData.sectorAllocation
    : [];

  const myLeaderboardRank = leaderboardData.find(p => p.isUser)?.rank || 1;

  const portfolioChartData = generateChartData(netWorth, 30, 0.01);

  const toggleChallenge = async (id) => {
    try {
      const res = await axios.post('/api/user/challenges/toggle', { challengeId: id });
      setUserData(res.data);
    } catch (err) {
      console.error('Error toggling challenge:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <div className="loading-spinner" style={{ fontSize: '1.25rem' }}>Loading TradeTrack Live...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Banner */}
      <motion.div
        className="welcome-banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="welcome-text">
          <h1>Welcome back, {userData?.name || 'Investor'}! 👋</h1>
          <p>
            <strong className={marketStatus?.isOpen ? 'text-gradient' : ''} style={{ color: marketStatus?.isOpen ? 'var(--brand-primary)' : 'var(--brand-danger)' }}>
              {marketStatus?.statusText || 'NSE LIVE'}
            </strong> · {marketStatus?.remainingText || 'Trading active'} · Your streak is on fire 🔥
          </p>
        </div>
        <div className="welcome-streak">
          <motion.div
            className="streak-badge"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame size={24} color="#ff4d6d" />
            <span className="streak-count">{streak}</span>
            <span className="streak-label">Day Streak</span>
          </motion.div>
          <div className="rank-display">
            <span className={`rank-badge ${rank.cssClass}`}>
              {rank.icon} {rank.name}
            </span>
            <span className="xp-count">{userXP.toLocaleString()} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          label="Total Net Worth"
          value={`₹${netWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          sub={`${pnlPercent >= 0 ? '+' : ''}${pnlPercent}% all time`}
          isUp={parseFloat(pnlPercent) >= 0}
          icon={<TrendingUp size={18} color="var(--brand-primary)" />}
          accent
        />
        <StatCard
          label="Invested Holdings"
          value={`₹${holdingsValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          sub={`${holdings.length} active stock${holdings.length !== 1 ? 's' : ''}`}
          isUp={true}
          icon={<Zap size={18} color="#ffbe0b" />}
        />
        <StatCard
          label="Total P&L"
          value={`${totalPnL >= 0 ? '+' : '-'}₹${Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          sub={`${pnlPercent >= 0 ? '+' : ''}${pnlPercent}% returns`}
          isUp={totalPnL >= 0}
          icon={<Star size={18} color="var(--brand-gold)" />}
        />
        <StatCard
          label="Leaderboard Rank"
          value={`#${myLeaderboardRank}`}
          sub="Based on XP and Returns"
          isUp={true}
          icon={<Trophy size={18} color="var(--brand-gold)" />}
        />
      </motion.div>

      {/* Main Grid */}
      <div className="dashboard-main-grid">
        {/* Portfolio Chart */}
        <motion.div
          className="card chart-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <div>
              <h2 className="card-title">Portfolio Performance</h2>
              <p className="card-sub">30-day virtual portfolio growth</p>
            </div>
            <div className="chart-period-tabs">
              {['1D', '1W', '1M', '3M', 'ALL'].map(p => (
                <button key={p} className={`period-tab ${p === '1M' ? 'active' : ''}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="chart-pnl-row">
            <span className="chart-portfolio-val">₹{netWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <span className={`chart-pnl-badge ${parseFloat(pnlPercent) >= 0 ? 'up' : 'down'}`}>
              {parseFloat(pnlPercent) >= 0 ? '+' : ''}{pnlPercent}% 
              {parseFloat(pnlPercent) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={portfolioChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f5a0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `₹${(v/100000).toFixed(1)}L`}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00f5a0"
                strokeWidth={2.5}
                fill="url(#portfolioGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Right Column */}
        <div className="dashboard-right-col">
          {/* XP Progress */}
          <motion.div
            className="card xp-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="xp-card-header">
              <div>
                <h3>Rank Progress</h3>
                <p className="text-sm text-muted">{xpToNext.toLocaleString()} XP to next level</p>
              </div>
              <span className={`rank-badge ${rank.cssClass}`}>{rank.icon} {rank.name}</span>
            </div>
            <div className="xp-progress-bar">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, xpProgress))}%` }}
                  transition={{ duration: 2, delay: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                />
              </div>
              <div className="xp-labels">
                <span>{userXP.toLocaleString()} XP</span>
                <span>{nextRank.minXP.toLocaleString()} XP 🐺</span>
              </div>
            </div>
            <div className="xp-badges-row">
              <div className="xp-stat">
                <span className="xp-stat-val text-gradient">{userXP.toLocaleString()}</span>
                <span className="xp-stat-label">Total XP</span>
              </div>
              <div className="xp-stat">
                <span className="xp-stat-val" style={{ color: '#ffbe0b' }}>8</span>
                <span className="xp-stat-label">Badges</span>
              </div>
              <div className="xp-stat">
                <span className="xp-stat-val" style={{ color: 'var(--brand-danger)' }}>{streak}</span>
                <span className="xp-stat-label">Day Streak</span>
              </div>
            </div>
          </motion.div>

          {/* Daily Challenges */}
          <motion.div
            className="card challenges-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header">
              <h3>Daily Challenges</h3>
              <span className="badge badge-primary">
                {completedChallenges.length}/{DAILY_CHALLENGES.length}
              </span>
            </div>
            <div className="challenges-list">
              {DAILY_CHALLENGES.map(challenge => {
                const done = completedChallenges.includes(challenge.id);
                return (
                  <motion.div
                    key={challenge.id}
                    className={`challenge-item ${done ? 'completed' : ''}`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleChallenge(challenge.id)}
                  >
                    <div className="challenge-icon">{challenge.icon}</div>
                    <div className="challenge-info">
                      <span className="challenge-title">{challenge.title}</span>
                      <span className="challenge-desc">{challenge.desc}</span>
                    </div>
                    <div className="challenge-right">
                      <span className="challenge-xp">+{challenge.xp} XP</span>
                      {done
                        ? <CheckCircle size={18} color="var(--brand-primary)" />
                        : <Circle size={18} color="var(--text-muted)" />
                      }
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom-grid">
        {/* Holdings */}
        <motion.div
          className="card holdings-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="card-header">
            <h3>My Holdings</h3>
            <button className="btn btn-secondary btn-sm" id="view-all-holdings-btn">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="holdings-table">
            <div className="holdings-header-row">
              <span>Stock</span>
              <span>Qty</span>
              <span>Avg Price</span>
              <span>LTP</span>
              <span>P&L</span>
            </div>
            {holdings.map(h => {
              const pl = h.pnl;
              const plPct = ((h.currentPrice - h.avgPrice) / h.avgPrice) * 100;
              const isUp = pl >= 0;
              return (
                <motion.div
                  key={h.symbol}
                  className="holdings-row"
                  whileHover={{ backgroundColor: 'rgba(0,245,160,0.03)' }}
                >
                  <div className="holding-stock">
                    <span className="holding-symbol">{h.symbol}</span>
                    <span className="holding-sector">{h.sector}</span>
                  </div>
                  <span className="holding-cell">{h.shares}</span>
                  <span className="holding-cell font-mono">₹{h.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span className="holding-cell font-mono">₹{h.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <div className={`holding-pl ${isUp ? 'up' : 'down'}`}>
                    <span>{isUp ? '+' : ''}₹{Math.abs(pl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    <span className="pl-pct">{isUp ? '+' : ''}{plPct.toFixed(2)}%</span>
                  </div>
                </motion.div>
              );
            })}
            {holdings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                No active holdings. Go to the <a href="/trade" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>Trade page</a> to start investing!
              </div>
            )}
          </div>
        </motion.div>

        {/* Sector Allocation + AI Insights */}
        <div className="dashboard-side-stack">
          {/* Sector Allocation */}
          <motion.div
            className="card sector-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <h3>Sector Allocation</h3>
            {sectorData.length > 0 ? (
              <div className="sector-chart-wrap">
                <PieChart width={140} height={140}>
                  <Pie
                    data={sectorData}
                    cx={65}
                    cy={65}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sectorData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="sector-legend">
                  {sectorData.map((s, i) => (
                    <div key={s.name} className="sector-legend-item">
                      <span className="sector-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="sector-name">{s.name}</span>
                      <span className="sector-pct">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active holdings to calculate sector allocation.
              </div>
            )}
          </motion.div>

          {/* AI Insights */}
          <motion.div
            className="card ai-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="card-header">
              <div className="ai-header">
                <Brain size={18} color="var(--brand-accent)" />
                <h3>AI Coach Insights</h3>
              </div>
              <span className="badge badge-accent">AI</span>
            </div>
            <div className="ai-insights-list">
              {AI_INSIGHTS.slice(0, 2).map((insight, i) => (
                <div key={i} className={`ai-insight-item ${insight.type}`}>
                  <span className="insight-icon">{insight.icon}</span>
                  <div className="insight-content">
                    <span className="insight-title">{insight.title}</span>
                    <span className="insight-msg">{insight.message}</span>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        </div>
      </div>

      {/* Recent Achievements */}
      <motion.div
        className="card achievements-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <div className="card-header">
          <h3>Achievements</h3>
          <button className="btn btn-ghost btn-sm">View all <ChevronRight size={14} /></button>
        </div>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map(a => (
            <motion.div
              key={a.id}
              className={`achievement-badge-item ${a.unlocked ? 'unlocked' : 'locked'} rarity-${a.rarity}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              title={a.desc}
            >
              <div className="achievement-icon">{a.unlocked ? a.icon : '🔒'}</div>
              <span className="achievement-name">{a.name}</span>
              <span className="achievement-xp">+{a.xp} XP</span>
              <span className={`rarity-tag ${a.rarity}`}>{a.rarity}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Battle CTA */}
      <motion.div
        className="battle-cta-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="battle-cta-bg" />
        <div className="battle-cta-content">
          <Swords size={32} color="white" />
          <div>
            <h3>Challenge Active!</h3>
            <p>Arjun Sharma challenged you to a 1v1 trading battle · 24h left</p>
          </div>
          <button className="btn btn-primary btn-lg" id="accept-battle-btn">
            Accept Battle ⚔️
          </button>
        </div>
      </motion.div>
    </div>
  );
}
