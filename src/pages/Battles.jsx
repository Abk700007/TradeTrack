import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Clock, Trophy, Users, Zap, ChevronRight, TrendingUp } from 'lucide-react';
import './Battles.css';

const ACTIVE_BATTLES = [
  {
    id: 1,
    opponent: { name: 'Arjun Sharma', avatar: '🦁', college: 'IIT Bombay', rank: '#1' },
    myReturn: +8.4,
    oppReturn: +12.1,
    timeLeft: '18h 32m',
    stake: 'Pride + 500 XP',
    status: 'losing',
    type: '1v1'
  },
  {
    id: 2,
    opponent: { name: 'Sneha Patel', avatar: '🦋', college: 'SRCC Delhi', rank: '#4' },
    myReturn: +5.2,
    oppReturn: +4.8,
    timeLeft: '5h 10m',
    stake: '200 XP',
    status: 'winning',
    type: '1v1'
  }
];

const TOURNAMENTS = [
  {
    id: 1, name: 'NSE Bull Run', icon: '🏆', type: 'Weekly',
    participants: 1247, prize: '10,000 XP', timeLeft: '3 days',
    myRank: 24, totalRanks: 1247
  },
  {
    id: 2, name: 'IIT-IIM Trading League', icon: '🎓', type: 'College',
    participants: 340, prize: '5,000 XP + Certificate', timeLeft: '5 days',
    myRank: 8, totalRanks: 340
  },
  {
    id: 3, name: 'Weekend Warriors', icon: '⚡', type: 'Flash',
    participants: 89, prize: '2,500 XP', timeLeft: '48h',
    myRank: null, totalRanks: 89, open: true
  }
];

export default function Battles() {
  const [activeTab, setActiveTab] = useState('My Battles');

  return (
    <div className="battles-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Swords size={28} color="var(--brand-accent)" /> Battles & Tournaments
          </h1>
          <p className="page-sub">Challenge traders, join tournaments, prove your edge</p>
        </div>
        <button className="btn btn-primary" id="challenge-btn">
          ⚔️ Challenge Someone
        </button>
      </div>

      {/* Tabs */}
      <div className="battles-tabs">
        {['My Battles', 'Tournaments', 'Find Opponents'].map(tab => (
          <button
            key={tab}
            id={`battles-tab-${tab.replace(/ /g, '-').toLowerCase()}`}
            className={`lb-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'My Battles' && (
        <div className="battles-grid">
          {ACTIVE_BATTLES.map(b => (
            <motion.div
              key={b.id}
              className={`card battle-card ${b.status}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
            >
              <div className="battle-card-header">
                <span className={`battle-status-badge ${b.status}`}>
                  {b.status === 'winning' ? '🔥 Winning' : '📉 Losing'}
                </span>
                <div className="battle-time">
                  <Clock size={13} />
                  {b.timeLeft} left
                </div>
              </div>

              <div className="battle-vs-row">
                <div className="battle-player me">
                  <span className="bp-avatar">🎯</span>
                  <span className="bp-name">You</span>
                  <span className={`bp-return ${b.myReturn >= 0 ? 'up' : 'down'}`}>
                    {b.myReturn >= 0 ? '+' : ''}{b.myReturn}%
                  </span>
                </div>
                <div className="vs-divider">VS</div>
                <div className="battle-player opp">
                  <span className="bp-avatar">{b.opponent.avatar}</span>
                  <span className="bp-name">{b.opponent.name}</span>
                  <span className={`bp-return ${b.oppReturn >= 0 ? 'up' : 'down'}`}>
                    {b.oppReturn >= 0 ? '+' : ''}{b.oppReturn}%
                  </span>
                </div>
              </div>

              <div className="battle-progress-bar">
                <div
                  className="battle-progress-fill"
                  style={{ width: `${(b.myReturn / (b.myReturn + b.oppReturn)) * 100}%` }}
                />
              </div>

              <div className="battle-meta">
                <span>🎁 Stake: {b.stake}</span>
                <span>{b.opponent.college} · {b.opponent.rank}</span>
              </div>
            </motion.div>
          ))}

          <motion.div
            className="card battle-card new-battle-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
          >
            <Swords size={32} color="var(--brand-accent)" />
            <h3>Start a New Battle</h3>
            <p>Challenge any trader from the leaderboard to a 1v1 virtual trading duel</p>
            <button className="btn btn-primary" id="new-battle-btn">⚔️ Find Opponent</button>
          </motion.div>
        </div>
      )}

      {activeTab === 'Tournaments' && (
        <div className="tournaments-list">
          {TOURNAMENTS.map(t => (
            <motion.div
              key={t.id}
              className="card tournament-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 4 }}
            >
              <div className="tournament-icon">{t.icon}</div>
              <div className="tournament-info">
                <div className="tournament-header">
                  <h3>{t.name}</h3>
                  <span className="badge badge-accent">{t.type}</span>
                </div>
                <div className="tournament-meta">
                  <span><Users size={13} /> {t.participants.toLocaleString()} traders</span>
                  <span><Trophy size={13} /> {t.prize}</span>
                  <span><Clock size={13} /> {t.timeLeft} left</span>
                </div>
                {t.myRank && (
                  <div className="tournament-my-rank">
                    Your rank: <strong>#{t.myRank}</strong> of {t.totalRanks.toLocaleString()}
                    <div className="t-rank-bar">
                      <div className="t-rank-fill" style={{ width: `${((t.totalRanks - t.myRank) / t.totalRanks) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <button
                className={`btn ${t.open ? 'btn-primary' : 'btn-secondary'}`}
                id={`tournament-${t.id}-btn`}
              >
                {t.open ? 'Join Now' : 'View'} <ChevronRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'Find Opponents' && (
        <div className="find-opponents">
          <div className="card find-opponents-card">
            <h3>Find a Trading Rival</h3>
            <p className="text-muted text-sm" style={{ marginTop: 4 }}>Challenge traders at your skill level</p>
            <div className="opponent-filters" style={{ marginTop: 16 }}>
              {['Similar Rank', 'Higher Rank', 'Same College', 'Random'].map(f => (
                <button key={f} id={`filter-${f.replace(/ /g, '-').toLowerCase()}-btn`} className="btn btn-secondary btn-sm">{f}</button>
              ))}
            </div>
            <div className="opponents-grid" style={{ marginTop: 20 }}>
              {[
                { name: 'Vikram Bose', avatar: '🐉', rank: '#7', returns: '+17.2%', xp: 8120 },
                { name: 'Ananya Singh', avatar: '🦋', rank: '#6', returns: '+19.7%', xp: 9340 },
                { name: 'Karthik R', avatar: '🦅', rank: '#5', returns: '+22.3%', xp: 10870 },
              ].map((o, i) => (
                <div key={i} className="opponent-card card">
                  <span className="opp-avatar">{o.avatar}</span>
                  <span className="opp-name">{o.name}</span>
                  <span className="opp-rank text-muted text-sm">{o.rank} · {o.xp.toLocaleString()} XP</span>
                  <span className="opp-returns up">{o.returns}</span>
                  <button className="btn btn-primary btn-sm" id={`challenge-${i}-btn`}>Challenge</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
