import { Link } from "react-router-dom";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { useTheme } from "../contexts/ThemeContext";
import "./LandingPage.css";

export default function Home() {
    const session = useSessionContext();
    const { theme, toggleTheme } = useTheme();

    if (session.loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            <span className="gradient-text">UpNXT</span>
                        </h1>
                        <p className="hero-subtitle">
                            Level up your productivity with gamified task management. 
                            <br />
                            <strong>Complete Quests. Earn XP. Level Up.</strong>
                        </p>
                        <p className="hero-description">
                            The ultimate productivity app that transforms your daily tasks into exciting quests. 
                            Build streaks, unlock achievements, and rocket your way to success with our 
                            gamified approach to getting things done.
                        </p>
                        
                        <div className="hero-actions">
                            {session.doesSessionExist ? (
                                <Link to="/dashboard" className="cta-button primary">
                                    <span>🚀</span>
                                    Launch Mission Control
                                </Link>
                            ) : (
                                <>
                                    <Link to="/dashboard" className="cta-button secondary">
                                        <span>👀</span>
                                        Preview Quest Board
                                    </Link>
                                    <Link to="/auth" className="cta-button primary">
                                        <span>🔐</span>
                                        Start Your Journey
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="hero-visual">
                        <div className="floating-card card-1">
                            <span className="card-icon">⚡</span>
                            <span className="card-text">Daily Quests</span>
                        </div>
                        <div className="floating-card card-2">
                            <span className="card-icon">🏆</span>
                            <span className="card-text">Achievement System</span>
                        </div>
                        <div className="floating-card card-3">
                            <span className="card-icon">📈</span>
                            <span className="card-text">Progress Tracking</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="features-content">
                    <h2>Why Choose UpNXT?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Quest-Based Tasks</h3>
                            <p>Transform mundane tasks into exciting quests with rewards and achievements</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>Streak System</h3>
                            <p>Build momentum with daily streaks and unlock bonus rewards</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔄</div>
                            <h3>Habit Evolution</h3>
                            <p>Level up your habits and watch them evolve into powerful routines</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎧</div>
                            <h3>Focus Mode</h3>
                            <p>Enter the zone with distraction-free deep work sessions</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Theme Toggle */}
            <button 
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
        </div>
    );
}
