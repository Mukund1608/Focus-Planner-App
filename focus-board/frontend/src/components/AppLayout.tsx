import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut, useSessionContext } from 'supertokens-auth-react/recipe/session';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './AppLayout.css';
import OfflineStatus from './OfflineStatus';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const session = useSessionContext();

  const getIsDesktop = () => (typeof window !== 'undefined' ? window.innerWidth > 1024 : true);

  const [isDesktop, setIsDesktop] = useState<boolean>(getIsDesktop());
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(getIsDesktop());

  useEffect(() => {
    const onResize = () => {
      const desktop = getIsDesktop();
      setIsDesktop(desktop);
      setIsSidebarOpen(desktop);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      navigate('/');
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Daily', icon: '📅' },
    { path: '/weekly', label: 'Weekly', icon: '📊' },
    { path: '/priority', label: 'Priority Board', icon: '🎯' },
    { path: '/habits', label: 'Habits', icon: '🔄' },
    { path: '/focus', label: 'Focus Mode', icon: '🎧' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    { path: '/notification-test', label: 'Test Notifications', icon: '🔔' },
  ];

  const closeSidebarOnNavigate = () => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  };

  const rootClasses = `app-layout ${isDarkMode ? 'dark' : 'light'} ${isDesktop && !isSidebarOpen ? 'sidebar-collapsed' : ''}`;
  const asideClasses = `sidebar ${!isDesktop ? (isSidebarOpen ? 'open' : '') : (!isSidebarOpen ? 'hidden' : '')}`;

  return (
    <div className={rootClasses}>
      <aside className={asideClasses}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon">🎯</span>
            <h1 className="brand-title">FocusBoard</h1>
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
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {session.doesSessionExist ? (
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

      {!isDesktop && isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      <main className="main-content">
        <header className="top-header">
          <div className="header-content">
            <div className="header-left">
              <button className="hamburger-btn" aria-label="Toggle menu" onClick={() => setIsSidebarOpen((v) => !v)}>
                {isSidebarOpen ? '✕' : '☰'}
              </button>
              {location.pathname !== '/' && (
                <Link to="/" className="home-link">
                  <span className="home-icon">🏠</span>
                  <span className="home-text">Back to Home</span>
                </Link>
              )}
            </div>
            <h2 className="page-title">
              {location.pathname === '/' ? 'FocusBoard' : navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
            <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <OfflineStatus />
              <span className="user-avatar">👤</span>
              <span className="user-name">
                {session.doesSessionExist ? 'User' : 'Preview Mode'}
              </span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {!session.doesSessionExist && (
            <div className="preview-banner">
              <div className="preview-content">
                <span className="preview-icon">👀</span>
                <span className="preview-text">You're in preview mode. Login to save your progress and access all features.</span>
                <Link to="/auth" className="preview-login-btn">Login Now</Link>
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
