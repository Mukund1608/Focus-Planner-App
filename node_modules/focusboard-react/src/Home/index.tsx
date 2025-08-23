import { Link } from "react-router-dom";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { useTheme } from "../contexts/ThemeContext";
import "./LandingPage.css";

export default function Home() {
    const session = useSessionContext();
    const { isDarkMode, toggleTheme } = useTheme();

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
                            <span className="gradient-text">Focus Planner</span>
                        </h1>
                        <p className="hero-subtitle">
                            Transform your productivity with intelligent task management. 
                            <br />
                            <strong>Prioritize. Focus. Execute.</strong>
                        </p>
                        <p className="hero-description">
                            The ultimate planning app that helps you organize tasks, build better habits, 
                            and achieve your goals with laser-sharp focus.
                        </p>
                        
                        <div className="hero-actions">
                            {session.doesSessionExist ? (
                                <Link to="/dashboard" className="cta-button primary">
                                    <span>🚀</span>
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/dashboard" className="cta-button secondary">
                                        <span>👀</span>
                                        Preview Dashboard
                                    </Link>
                                    <Link to="/auth" className="cta-button primary">
                                        <span>🔐</span>
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="hero-visual">
                        <div className="floating-card card-1">
                            <span className="card-icon">📋</span>
                            <span className="card-text">Task Management</span>
                        </div>
                        <div className="floating-card card-2">
                            <span className="card-icon">🎯</span>
                            <span className="card-text">Priority Focus</span>
                        </div>
                        <div className="floating-card card-3">
                            <span className="card-icon">📊</span>
                            <span className="card-text">Progress Tracking</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="features-content">
                    <h2>Why Choose Focus Planner?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Smart Prioritization</h3>
                            <p>Automatically organize tasks by importance and urgency</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📅</div>
                            <h3>Flexible Views</h3>
                            <p>Daily, weekly, and priority board views to match your workflow</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔄</div>
                            <h3>Habit Building</h3>
                            <p>Track and build positive habits that stick</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎧</div>
                            <h3>Focus Mode</h3>
                            <p>Distraction-free environment for deep work</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Theme Toggle */}
            <button 
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
                {isDarkMode ? '☀️' : '🌙'}
            </button>
        </div>
    );
}
