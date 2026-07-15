import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Crown, Star, TrendingUp } from 'lucide-react';
import axios from 'axios';
import './Leaderboard.css';

const TABS = ['Global', 'Friends', 'College', 'Weekly'];
const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('Global');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/leaderboard');
        setLeaderboardData(res.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-muted)' }}>
        <div className="loading-spinner" style={{ fontSize: '1.25rem' }}>Loading Leaderboard...</div>
      </div>
    );
  }

  // Fallback in case of empty data
  const topThree = leaderboardData.slice(0, 3);
  const tableData = leaderboardData;

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Trophy size={28} color="var(--brand-gold)" /> Leaderboard
          </h1>
          <p className="page-sub">Compete with the best traders in India</p>
        </div>
        <div className="leaderboard-season">
          <Star size={14} color="var(--brand-gold)" />
          <span>Season 3 · Ends in 12 days</span>
        </div>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <motion.div
          className="podium-container card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="podium-bg-glow" />
          <h2 className="podium-title">🏆 Top Traders This Season</h2>
          <div className="podium">
            {/* 2nd Place */}
            <motion.div
              className="podium-slot rank-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="podium-avatar">{topThree[1].avatar}</div>
              <div className="podium-name">{topThree[1].name}</div>
              <div className="podium-college">{topThree[1].college}</div>
              <div className="podium-returns up">{topThree[1].returns}</div>
              <div className="podium-platform p2">2nd</div>
              <div className="podium-pillar p2" />
            </motion.div>

            {/* 1st Place */}
            <motion.div
              className="podium-slot rank-1"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="crown-anim">👑</div>
              <div className="podium-avatar large">{topThree[0].avatar}</div>
              <div className="podium-name">{topThree[0].name}</div>
              <div className="podium-college">{topThree[0].college}</div>
              <div className="podium-returns up">{topThree[0].returns}</div>
              <div className="podium-xp">{topThree[0].xp.toLocaleString()} XP</div>
              <div className="podium-platform p1">1st</div>
              <div className="podium-pillar p1" />
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              className="podium-slot rank-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="podium-avatar">{topThree[2].avatar}</div>
              <div className="podium-name">{topThree[2].name}</div>
              <div className="podium-college">{topThree[2].college}</div>
              <div className="podium-returns up">{topThree[2].returns}</div>
              <div className="podium-platform p3">3rd</div>
              <div className="podium-pillar p3" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="leaderboard-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            id={`lb-tab-${tab.toLowerCase()}`}
            className={`lb-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Full Table */}
      <motion.div
        className="card leaderboard-table"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="lb-table-header">
          <span>#</span>
          <span>Trader</span>
          <span>College</span>
          <span>Portfolio Value</span>
          <span>Returns</span>
          <span>XP</span>
          <span>Badge</span>
        </div>

        {tableData.map((trader, i) => (
          <motion.div
            key={trader.rank}
            id={`lb-row-${trader.rank}`}
            className={`lb-row ${trader.isUser ? 'is-user' : ''} ${trader.rank <= 3 ? 'top-three' : ''}`}
            onMouseEnter={() => setHoveredRow(trader.rank)}
            onMouseLeave={() => setHoveredRow(null)}
            whileHover={{ x: 4 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <div className={`lb-rank ${trader.rank <= 3 ? `medal-${trader.rank}` : ''}`}>
              {trader.rank <= 3
                ? <span className="medal-emoji">{RANK_ICONS[trader.rank]}</span>
                : <span>#{trader.rank}</span>
              }
            </div>
            <div className="lb-trader">
              <span className="trader-avatar">{trader.avatar}</span>
              <div>
                <span className="trader-name">{trader.name}</span>
                {trader.isUser && <span className="you-tag">YOU</span>}
              </div>
            </div>
            <span className="lb-cell lb-college">{trader.college}</span>
            <span className="lb-cell font-mono">{trader.portfolio}</span>
            <span className={`lb-cell lb-returns ${parseFloat(trader.returns) >= 0 ? 'up' : 'down'}`}>
              <TrendingUp size={13} style={{ transform: parseFloat(trader.returns) >= 0 ? 'none' : 'rotate(90deg)' }} />
              {trader.returns}
            </span>
            <span className="lb-cell lb-xp font-mono">{trader.xp.toLocaleString()}</span>
            <span className="lb-badge-cell">{trader.badge}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Challenge CTA */}
      <motion.div
        className="card challenge-cta-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Users size={20} color="var(--brand-primary)" />
        <div>
          <h4>Challenge a trader to a 1v1 battle</h4>
          <p>Pick any trader from the leaderboard and challenge them to a virtual trading duel</p>
        </div>
        <button className="btn btn-primary" id="start-battle-btn">
          ⚔️ Start Battle
        </button>
      </motion.div>
    </div>
  );
}
