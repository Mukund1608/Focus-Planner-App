import React from 'react';
import './Dashboard.css';

export default function Dashboard() {
    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Welcome to FocusBoard</h1>
                <p>Organize your tasks, prioritize your work, and build better habits</p>
            </div>

            <div className="dashboard-overview">
                <div className="overview-section">
                    <h2>Quick Overview</h2>
                    <div className="overview-cards">
                        <div className="overview-card">
                            <div className="card-icon">📅</div>
                            <h3>Daily Tasks</h3>
                            <p>Manage your daily tasks and track your progress</p>
                        </div>
                        <div className="overview-card">
                            <div className="card-icon">🎯</div>
                            <h3>Priority Board</h3>
                            <p>Organize tasks by priority and importance</p>
                        </div>
                        <div className="overview-card">
                            <div className="card-icon">🔄</div>
                            <h3>Habits</h3>
                            <p>Build and track positive habits</p>
                        </div>
                        <div className="overview-card">
                            <div className="card-icon">🎧</div>
                            <h3>Focus Mode</h3>
                            <p>Distraction-free environment for deep work</p>
                        </div>
                    </div>
                </div>

                <div className="why-choose-section">
                    <h2>Why Choose FocusBoard?</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <h3>Boost Productivity</h3>
                            <p>Streamline your workflow with intelligent task management and priority-based organization.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🎯</div>
                            <h3>Stay Focused</h3>
                            <p>Eliminate distractions with our dedicated focus mode and habit tracking system.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <h3>Track Progress</h3>
                            <p>Monitor your daily, weekly, and long-term progress with detailed analytics.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🔄</div>
                            <h3>Build Habits</h3>
                            <p>Create lasting positive habits with our comprehensive habit tracking and reminder system.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🎨</div>
                            <h3>Beautiful Design</h3>
                            <p>Enjoy a clean, modern interface that adapts to your preferred color scheme.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📱</div>
                            <h3>Cross-Platform</h3>
                            <p>Access your tasks and progress from any device with our responsive design.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
