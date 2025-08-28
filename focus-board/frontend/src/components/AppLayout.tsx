import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut, useSessionContext } from 'supertokens-auth-react/recipe/session';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import './AppLayout.css';
import OfflineStatus from './OfflineStatus';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const session = useSessionContext();

  // Sidebar is always open, no state needed

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Mission Control', icon: '🚀' },
    { path: '/priority', label: 'Priority Board', icon: '🏆' },
    { path: '/daily', label: 'Daily Quests', icon: '⚡' },
    { path: '/weekly', label: 'Weekly Goals', icon: '🎯' },
    { path: '/habits', label: 'Habit Tracker', icon: '🔄' },
    { path: '/focus', label: 'Focus Mode', icon: '🎧' },
    { path: '/exam', label: 'Exam Mode', icon: '📚' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const closeSidebarOnNavigate = () => {
    // Sidebar stays open always, no need to close on navigation
  };

  const rootClasses = `app-layout ${theme === 'dark' ? 'dark' : 'light'}`;
  const asideClasses = `sidebar`;

  return (
    <div className={rootClasses}>
      <aside className={asideClasses}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon">🚀</span>
            <h1 className="brand-title display">UpNXT</h1>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={closeSidebarOnNavigate}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
                          <ThemeToggle />
          {!session.loading && session.doesSessionExist ? (
            <button className="logout-btn" onClick={handleLogout}>
              <span className="logout-icon">🚪</span>
              <span className="logout-label">Logout</span>
            </button>
          ) : (
            <Link to="/auth" className="login-btn">
              <span className="login-icon">🔐</span>
              <span className="login-label">Login</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Removed sidebar overlay since sidebar is always open */}

      <main className="main-content">
        <header className="top-header">
          <div className="header-content">
            <div className="header-left">
              {/* Removed hamburger button since sidebar is always open */}
            </div>
            <h2 className="page-title text-h2">
              {location.pathname === '/' ? 'UpNXT' : navItems.find(item => item.path === location.pathname)?.label || 'Mission Control'}
            </h2>
            <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <OfflineStatus />
              <span className="user-avatar">👤</span>
              <span className="user-name text-body-sm">
                {!session.loading && session.doesSessionExist ? 'Explorer' : 'Preview Mode'}
              </span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {!session.loading && !session.doesSessionExist && (
            <div className="preview-banner">
              <div className="preview-content">
                <span className="preview-icon">👀</span>
                <span className="preview-text text-body">You're in preview mode. Login to save your progress and access all features.</span>
                <Link to="/auth" className="preview-login-btn btn-primary">Login Now</Link>
              </div>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
