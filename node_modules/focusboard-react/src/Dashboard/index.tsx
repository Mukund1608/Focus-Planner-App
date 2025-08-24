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




      </div>
    </div>
  );
};

export default Dashboard;
