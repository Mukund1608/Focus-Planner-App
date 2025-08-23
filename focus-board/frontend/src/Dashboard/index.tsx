import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { useTheme } from '../contexts/ThemeContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const session = useSessionContext();
  const { theme } = useTheme();

  if (session.loading) {
    return (
      <div className={`dashboard ${theme}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your mission control...</p>
        </div>
      </div>
    );
  }

  if (!session.doesSessionExist) {
    return (
      <div className={`dashboard ${theme}`}>
        <div className="auth-required">
          <h1 className="text-display text-primary">Welcome to UpNXT</h1>
          <p className="text-body-lg text-secondary">
            Please sign in to access your mission control dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard ${theme}`}>
      <div className="dashboard-header">
        <h1 className="text-display text-primary">Mission Control</h1>
        <p className="text-body-lg text-secondary">
          Welcome back, Explorer! Ready to tackle today's quests?
        </p>
      </div>

      <div className="dashboard-content">
        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3 className="stat-number">12</h3>
              <p className="stat-label">Active Quests</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-number">8</h3>
              <p className="stat-label">Completed Today</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3 className="stat-number">15</h3>
              <p className="stat-label">Day Streak</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3 className="stat-number">2,450</h3>
              <p className="stat-label">Total XP</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="text-h2 text-primary">Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn">
              <span className="action-icon">➕</span>
              <span className="action-label">Add New Quest</span>
            </button>
            
            <button className="action-btn">
              <span className="action-icon">🎯</span>
              <span className="action-label">Start Focus Session</span>
            </button>
            
            <button className="action-btn">
              <span className="action-icon">📊</span>
              <span className="action-label">View Progress</span>
            </button>
            
            <button className="action-btn">
              <span className="action-icon">⚙️</span>
              <span className="action-label">Settings</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2 className="text-h2 text-primary">Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <p className="activity-text">Completed "Review project proposal"</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">🎯</div>
              <div className="activity-content">
                <p className="activity-text">Started focus session</p>
                <span className="activity-time">4 hours ago</span>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">➕</div>
              <div className="activity-content">
                <p className="activity-text">Added new quest "Prepare presentation"</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
