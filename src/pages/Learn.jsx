import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, CheckCircle, Lock, Brain, TrendingUp, Star, ChevronRight } from 'lucide-react';
import './Learn.css';

const MODULES = [
  {
    id: 1, icon: '📊', title: 'Stock Market Basics', level: 'Beginner',
    lessons: 8, completed: 8, xp: 200, locked: false, done: true,
    desc: 'Understand how stock markets work, NSE, BSE, and basic concepts'
  },
  {
    id: 2, icon: '📈', title: 'Reading Candlestick Charts', level: 'Beginner',
    lessons: 12, completed: 7, xp: 300, locked: false, done: false,
    desc: 'Master the art of reading price charts and candlestick patterns'
  },
  {
    id: 3, icon: '🎯', title: 'Technical Analysis', level: 'Intermediate',
    lessons: 15, completed: 0, xp: 500, locked: false, done: false,
    desc: 'RSI, MACD, Moving Averages, Bollinger Bands and more'
  },
  {
    id: 4, icon: '🧠', title: 'Trading Psychology', level: 'Intermediate',
    lessons: 10, completed: 0, xp: 400, locked: true, done: false,
    desc: 'Control emotions, avoid FOMO, and build discipline'
  },
  {
    id: 5, icon: '⚡', title: 'Options & Derivatives', level: 'Advanced',
    lessons: 20, completed: 0, xp: 800, locked: true, done: false,
    desc: 'Calls, puts, F&O strategies for NSE derivatives'
  },
  {
    id: 6, icon: '🤖', title: 'AI-Powered Trading Strategies', level: 'Advanced',
    lessons: 18, completed: 0, xp: 1000, locked: true, done: false,
    desc: 'Use quantitative methods and algorithmic thinking in trading'
  },
];

const QUICK_LESSONS = [
  { icon: '💡', title: 'What is P/E Ratio?', duration: '3 min', xp: 25 },
  { icon: '📉', title: 'How Stop Loss Works', duration: '4 min', xp: 30 },
  { icon: '🎯', title: 'Support & Resistance', duration: '5 min', xp: 35 },
  { icon: '📊', title: 'Volume Analysis Basics', duration: '4 min', xp: 30 },
];

const LEVEL_COLORS = {
  Beginner: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)' },
  Intermediate: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' },
  Advanced: { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)' },
};

export default function Learn() {
  const [selectedModule, setSelectedModule] = useState(null);

  return (
    <div className="learn-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BookOpen size={28} color="var(--brand-secondary)" /> Learn to Trade
          </h1>
          <p className="page-sub">Structured learning paths · Earn XP · Master the markets</p>
        </div>
        <div className="learn-streak-badge">
          <Brain size={16} color="var(--brand-accent)" />
          <span>Learning Streak: <strong>7 days</strong></span>
        </div>
      </div>

      {/* Progress Overview */}
      <motion.div
        className="card learn-progress-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="lp-stats">
          {[
            { icon: '📚', label: 'Modules Done', value: '1/6' },
            { icon: '✅', label: 'Lessons Done', value: '15/83' },
            { icon: '⭐', label: 'XP from Learning', value: '620' },
            { icon: '🔥', label: 'Learning Streak', value: '7 days' },
          ].map(s => (
            <div key={s.label} className="lp-stat">
              <span className="lp-stat-icon">{s.icon}</span>
              <span className="lp-stat-val">{s.value}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="lp-overall-progress">
          <div className="lp-progress-label">
            <span>Overall Progress</span>
            <span>18%</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: '18%' }}
              transition={{ duration: 1.5, delay: 0.5 }}
              style={{ height: 8 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Lessons */}
      <div className="section">
        <h2 className="section-title">⚡ Quick Lessons <span className="text-muted text-sm">5 min or less</span></h2>
        <div className="quick-lessons-grid">
          {QUICK_LESSONS.map((lesson, i) => (
            <motion.div
              key={i}
              className="card quick-lesson-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              id={`quick-lesson-${i}-btn`}
            >
              <span className="ql-icon">{lesson.icon}</span>
              <span className="ql-title">{lesson.title}</span>
              <div className="ql-meta">
                <span>{lesson.duration}</span>
                <span className="ql-xp">+{lesson.xp} XP</span>
              </div>
              <button className="btn btn-primary btn-sm ql-play-btn">
                <Play size={12} /> Start
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Modules */}
      <div className="section">
        <h2 className="section-title">📚 Learning Modules</h2>
        <div className="modules-grid">
          {MODULES.map((mod, i) => {
            const levelStyle = LEVEL_COLORS[mod.level];
            const progress = (mod.completed / mod.lessons) * 100;

            return (
              <motion.div
                key={mod.id}
                id={`module-${mod.id}-card`}
                className={`card module-card ${mod.locked ? 'locked' : ''} ${mod.done ? 'done' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={!mod.locked ? { y: -4 } : {}}
                onClick={() => !mod.locked && setSelectedModule(mod)}
              >
                {mod.locked && <div className="module-lock-overlay"><Lock size={24} /></div>}

                <div className="module-icon">{mod.locked ? '🔒' : mod.icon}</div>
                <div className="module-level-badge" style={{
                  background: levelStyle.bg,
                  color: levelStyle.color,
                  border: `1px solid ${levelStyle.border}`,
                }}>
                  {mod.level}
                </div>
                <h3 className="module-title">{mod.title}</h3>
                <p className="module-desc">{mod.desc}</p>
                <div className="module-footer">
                  <div className="module-progress-wrap">
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div className="progress-fill" style={{ width: `${progress}%`, height: 4 }} />
                    </div>
                    <span className="module-progress-txt">{mod.completed}/{mod.lessons} lessons</span>
                  </div>
                  <div className="module-xp">+{mod.xp} XP</div>
                </div>

                {mod.done && (
                  <div className="module-done-badge">
                    <CheckCircle size={14} /> Completed
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
