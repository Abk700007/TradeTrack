import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, BarChart2, Trophy, Users,
  BookOpen, Zap, Bell, Settings, ChevronRight, Flame,
  Crown, Star, X, Menu, LogOut, Trash2, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { getUserRank } from '../data/marketData';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', id: 'nav-dashboard' },
  { to: '/markets', icon: TrendingUp, label: 'Markets', id: 'nav-markets', badge: 'LIVE' },
  { to: '/portfolio', icon: BarChart2, label: 'Portfolio', id: 'nav-portfolio' },
  { to: '/trade', icon: Zap, label: 'Trade', id: 'nav-trade', highlight: true },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', id: 'nav-leaderboard' },
  { to: '/battles', icon: Users, label: 'Battles', id: 'nav-battles', badge: '2' },
  { to: '/learn', icon: BookOpen, label: 'Learn', id: 'nav-learn' },
];

export default function Sidebar({ onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [user, setUser] = useState({
    name: 'Investor',
    username: '@trader',
    balance: 1000000,
    xp: 0,
    streak: 1,
    college: 'Investor'
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/user');
        if (res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('Error fetching user profile in sidebar:', err);
      }
    };
    fetchUser();
  }, []);

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete('/api/user/delete-account');
      setShowDeleteModal(false);
      if (onLogout) onLogout();
    } catch (err) {
      console.error('Error deleting account:', err);
      alert(err.response?.data?.error || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const rank = getUserRank(user.xp || 0);
  const xpProgress = Math.min(100, Math.max(5, ((user.xp || 0) / 5000) * 100));

  const SidebarContent = () => (
    <div className="sidebar-inner">
      {/* Logo */}
      <div className="sidebar-logo">
        <motion.div
          className="logo-icon"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          📈
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="logo-text"
          >
            <span className="logo-name">TradeTrack</span>
            <span className="logo-tagline">Trade. Compete. Dominate.</span>
          </motion.div>
        )}
        <button
          className="sidebar-toggle btn btn-ghost btn-icon desktop-only"
          onClick={() => setCollapsed(!collapsed)}
          id="sidebar-toggle-btn"
        >
          <ChevronRight size={16} style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
        </button>
      </div>

      {/* User Card */}
      <div className="sidebar-user-card">
        <div className="user-avatar-wrap">
          <span className="user-avatar">🎯</span>
          <div className="user-streak">
            <Flame size={10} />
            {user.streak || 1}
          </div>
        </div>
        {!collapsed && (
          <motion.div
            className="user-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="user-name">{user.name}</span>
            <span className="user-username">@{user.username}</span>
            <div className={`rank-badge ${rank.cssClass}`} style={{ fontSize: '0.65rem', padding: '2px 8px', marginTop: 4 }}>
              {rank.icon} {rank.name}
            </div>
            <div className="xp-bar-container">
              <div className="xp-bar-labels">
                <span>{(user.xp || 0).toLocaleString()} XP</span>
                <span>5,000 XP</span>
              </div>
              <div className="progress-bar" style={{ height: 4 }}>
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  style={{ height: 4 }}
                />
              </div>
            </div>
            <div className="user-balance">
              <span className="balance-label">Virtual Cash</span>
              <span className="balance-amount">₹{(user.balance || 1000000).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            id={item.id}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <div className="nav-item-icon">
              <item.icon size={20} />
            </div>
            {!collapsed && (
              <motion.span
                className="nav-item-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {item.label}
              </motion.span>
            )}
            {!collapsed && item.badge && (
              <span className={`nav-badge ${item.badge === 'LIVE' ? 'live' : 'count'}`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-nav-item"
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          onClick={onLogout}
          id="nav-logout-btn"
        >
          <div className="nav-item-icon">
            <LogOut size={18} />
          </div>
          {!collapsed && <span className="nav-item-label" style={{ fontWeight: 600 }}>Log Out</span>}
        </button>
        
        <button
          className="sidebar-nav-item"
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--brand-danger)' }}
          onClick={() => setShowDeleteModal(true)}
          id="nav-delete-account-btn"
        >
          <div className="nav-item-icon">
            <Trash2 size={18} />
          </div>
          {!collapsed && <span className="nav-item-label" style={{ fontWeight: 600 }}>Delete Account</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={`sidebar ${collapsed ? 'collapsed' : ''}`}
        animate={{ width: collapsed ? 72 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setMobileOpen(true)}
          id="mobile-menu-btn"
        >
          <Menu size={22} />
        </button>
        <div className="mobile-logo">
          <span>📈</span>
          <span className="logo-name">TradeTrack</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="user-streak mobile-streak">
            <Flame size={12} />
            {user.streak || 1}
          </div>
          <span className="user-avatar" style={{ fontSize: '1.4rem' }}>🎯</span>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="sidebar mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
                <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
            style={{ zIndex: 2000 }}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ textAlign: 'center', maxWidth: 400 }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(255, 77, 109, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                margin: '0 auto 16px',
                color: 'var(--brand-danger)'
              }}>
                <AlertTriangle size={28} />
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
                Delete Account & All Data?
              </h2>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 24 }}>
                This will permanently remove your user profile (<strong style={{ color: '#fff' }}>@{user.username}</strong>), stock holdings, and trade history from the database. <strong>This action cannot be undone.</strong>
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger w-full"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
