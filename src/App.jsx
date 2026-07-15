import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Sidebar from './components/Sidebar';
import TickerTape from './components/TickerTape';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Trade from './pages/Trade';
import Portfolio from './pages/Portfolio';
import Leaderboard from './pages/Leaderboard';
import Battles from './pages/Battles';
import Learn from './pages/Learn';

export default function App() {
  const [secretKey, setSecretKey] = useState(() => localStorage.getItem('tradetrack_secret_key') || '');

  useEffect(() => {
    if (secretKey) {
      axios.defaults.headers.common['x-secret-key'] = secretKey;
    } else {
      delete axios.defaults.headers.common['x-secret-key'];
    }
  }, [secretKey]);

  const handleLogin = (key) => {
    localStorage.setItem('tradetrack_secret_key', key);
    axios.defaults.headers.common['x-secret-key'] = key;
    setSecretKey(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('tradetrack_secret_key');
    delete axios.defaults.headers.common['x-secret-key'];
    setSecretKey('');
  };

  if (!secretKey) {
    return <LandingPage onLoginSuccess={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary, #0a0e17)' }}>
        <Sidebar onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TickerTape />
          <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/trade" element={<Trade />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/battles" element={<Battles />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
