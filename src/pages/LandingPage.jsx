import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ShieldCheck, Zap, Trophy, Brain, Key, Copy, Check, ArrowRight, X } from 'lucide-react';
import axios from 'axios';
import './LandingPage.css';

export default function LandingPage({ onLoginSuccess }) {
  const [activeModal, setActiveModal] = useState(null); // 'signup' | 'login' | 'key_display' | null
  
  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [college, setCollege] = useState('');
  const [secretKeyInput, setSecretKeyInput] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await axios.post('/api/user/signup', { name, username, college });
      setGeneratedKey(res.data.secretKey);
      setActiveModal('key_display');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await axios.post('/api/user/login', { secretKey: secretKeyInput });
      const user = res.data.user;
      localStorage.setItem('tradetrack_secret_key', user.secretKey);
      setActiveModal(null);
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid secret key.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchAppWithGeneratedKey = () => {
    localStorage.setItem('tradetrack_secret_key', generatedKey);
    setActiveModal(null);
    if (onLoginSuccess) onLoginSuccess();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="landing-container">
      {/* Background Glows */}
      <div className="bg-glow glow-1" />
      <div className="bg-glow glow-2" />

      {/* Header */}
      <header className="landing-header">
        <div className="brand-logo">
          <div className="logo-icon">📈</div>
          <span className="brand-title">Trade<span className="text-gradient">Track</span></span>
        </div>
        <div className="landing-nav-btns">
          <button className="btn btn-ghost" onClick={() => { setActiveModal('login'); setErrorMsg(''); }}>
            <Key size={16} /> Log In
          </button>
          <button className="btn btn-primary" onClick={() => { setActiveModal('signup'); setErrorMsg(''); }}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Zap size={14} color="#00f5a0" />
          <span>India's Premium Gamified Stock Trading Platform</span>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Master Indian Stock Markets with <br />
          <span className="text-gradient">Zero Financial Risk</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Practice Intraday & Delivery trading on NSE/BSE stocks with ₹10,00,000 virtual cash, 
          real-time price updates, AI risk insights, and competitive college leagues.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button className="btn btn-primary btn-lg" onClick={() => { setActiveModal('signup'); setErrorMsg(''); }}>
            Start Trading Free 🚀
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => { setActiveModal('login'); setErrorMsg(''); }}>
            <Key size={18} /> Enter Secret Key
          </button>
        </motion.div>

        {/* Floating Stat Pills */}
        <motion.div
          className="hero-stats-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-pill">
            <span className="pill-val">₹10 Lakh</span>
            <span className="pill-lbl">Virtual Portfolio</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-pill">
            <span className="pill-val">NSE / BSE</span>
            <span className="pill-lbl">Live Feeds</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-pill">
            <span className="pill-val">100% Free</span>
            <span className="pill-lbl">No Credit Card</span>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          className="features-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="feature-card">
            <div className="feat-icon" style={{ background: 'rgba(0, 245, 160, 0.1)', color: '#00f5a0' }}>
              <TrendingUp size={24} />
            </div>
            <h3>Real-Time NSE Feeds</h3>
            <p>Track live prices, historical candlestick charts, and market movements seamlessly.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon" style={{ background: 'rgba(0, 217, 245, 0.1)', color: '#00d9f5' }}>
              <ShieldCheck size={24} />
            </div>
            <h3>Simulated Trading</h3>
            <p>Test Intraday & Delivery orders with leverage margins without losing real money.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <Brain size={24} />
            </div>
            <h3>AI Trading Coach</h3>
            <p>Get automated portfolio risk warnings, entry timing tips, and sector analysis.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon" style={{ background: 'rgba(255, 190, 11, 0.1)', color: '#ffbe0b' }}>
              <Trophy size={24} />
            </div>
            <h3>Competitive Ranks</h3>
            <p>Earn XP, unlock achievements, maintain streaks, and climb national leaderboards.</p>
          </div>
        </motion.div>
      </main>

      {/* Auth Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>

              {/* SIGNUP MODAL */}
              {activeModal === 'signup' && (
                <div>
                  <h2 className="modal-title">Create Your Account</h2>
                  <p className="modal-sub">Start your virtual trading journey in 10 seconds.</p>

                  <form onSubmit={handleSignup} className="auth-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        className="input"
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Username</label>
                      <input
                        className="input"
                        placeholder="e.g. rahul_trader"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>College / Institution (Optional)</label>
                      <input
                        className="input"
                        placeholder="e.g. IIT Bombay / Investor"
                        value={college}
                        onChange={e => setCollege(e.target.value)}
                      />
                    </div>

                    {errorMsg && <div className="auth-error">{errorMsg}</div>}

                    <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Generate Secret Key 🔑'}
                    </button>
                  </form>
                </div>
              )}

              {/* KEY DISPLAY MODAL */}
              {activeModal === 'key_display' && (
                <div className="key-display-view">
                  <div className="key-icon-wrap">
                    <Key size={32} color="#00f5a0" />
                  </div>
                  <h2>Your Secret Access Key</h2>
                  <p className="modal-sub">
                    Save this key! You will use this Secret Key to log into TradeTrack next time.
                  </p>

                  <div className="secret-key-box">
                    <span className="key-text">{generatedKey}</span>
                    <button className="copy-btn" onClick={copyToClipboard}>
                      {copied ? <Check size={16} color="#00f5a0" /> : <Copy size={16} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <button className="btn btn-primary w-full btn-lg" onClick={handleLaunchAppWithGeneratedKey}>
                    Launch My Terminal 🚀
                  </button>
                </div>
              )}

              {/* LOGIN MODAL */}
              {activeModal === 'login' && (
                <div>
                  <h2 className="modal-title">Log In with Secret Key</h2>
                  <p className="modal-sub">Enter your unique key to access your portfolio.</p>

                  <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                      <label>Secret Key</label>
                      <input
                        className="input font-mono"
                        placeholder="e.g. TT-A1B2-C3D4"
                        value={secretKeyInput}
                        onChange={e => setSecretKeyInput(e.target.value)}
                        required
                      />
                    </div>

                    {errorMsg && <div className="auth-error">{errorMsg}</div>}

                    <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                      {loading ? 'Verifying Key...' : 'Unlock Terminal 🔓'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
