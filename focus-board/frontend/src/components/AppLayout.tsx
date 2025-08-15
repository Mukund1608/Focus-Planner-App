import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'supertokens-auth-react/recipe/session';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const getIsDesktop = () => (typeof window !== 'undefined' ? window.innerWidth > 1024 : true);

  const [isDesktop, setIsDesktop] = useState<boolean>(getIsDesktop());
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(getIsDesktop());

  useEffect(() => {
    const onResize = () => {
      const desktop = getIsDesktop();
      setIsDesktop(desktop);
      // When switching to desktop, ensure sidebar is open by default
      // When switching to mobile, close it by default
      setIsSidebarOpen(desktop);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Daily', icon: '📅' },
    { path: '/weekly', label: 'Weekly', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
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
      {/* Fixed Sidebar */}
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
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {!isDesktop && isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-content">
            <button
              className="hamburger-btn"
              aria-label="Toggle menu"
              onClick={() => setIsSidebarOpen((v) => !v)}
            >
              {isSidebarOpen ? '✕' : '☰'}
            </button>
            <h2 className="page-title">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
            <div className="user-info">
              <span className="user-avatar">👤</span>
              <span className="user-name">User</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
