import React, { useState } from 'react';
import './Dashboard.css';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('daily');

    const tabs = [
        { id: 'daily', label: 'Daily Tasks', icon: '📅' },
        { id: 'priority', label: 'Priority Board', icon: '🎯' },
        { id: 'habits', label: 'Habits', icon: '🔄' },
        { id: 'focus', label: 'Focus Mode', icon: '🎧' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'daily':
                return (
                    <div className="daily-view">
                        <h2>Daily Tasks</h2>
                        <div className="placeholder-content">
                            <p>Your daily task management will appear here</p>
                            <div className="placeholder-card">
                                <span className="placeholder-icon">📝</span>
                                <p>Add your first daily task</p>
                            </div>
                        </div>
                    </div>
                );
            case 'priority':
                return (
                    <div className="priority-view">
                        <h2>Priority Board</h2>
                        <div className="placeholder-content">
                            <p>Organize tasks by priority level</p>
                            <div className="priority-columns">
                                <div className="priority-column urgent">
                                    <h3>🚨 Urgent</h3>
                                    <div className="placeholder-task">No urgent tasks</div>
                                </div>
                                <div className="priority-column high">
                                    <h3>🔥 High</h3>
                                    <div className="placeholder-task">No high priority tasks</div>
                                </div>
                                <div className="priority-column medium">
                                    <h3>⚡ Medium</h3>
                                    <div className="placeholder-task">No medium priority tasks</div>
                                </div>
                                <div className="priority-column low">
                                    <h3>🌱 Low</h3>
                                    <div className="placeholder-task">No low priority tasks</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'habits':
                return (
                    <div className="habits-view">
                        <h2>Habits</h2>
                        <div className="placeholder-content">
                            <p>Track your daily habits and routines</p>
                            <div className="placeholder-card">
                                <span className="placeholder-icon">🔄</span>
                                <p>Start building positive habits</p>
                            </div>
                        </div>
                    </div>
                );
            case 'focus':
                return (
                    <div className="focus-view">
                        <h2>Focus Mode</h2>
                        <div className="placeholder-content">
                            <p>Enter deep work mode with focused task management</p>
                            <div className="placeholder-card">
                                <span className="placeholder-icon">🎧</span>
                                <p>Enable focus mode to get things done</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Welcome to FocusBoard</h1>
                <p>Organize your tasks, prioritize your work, and build better habits</p>
            </div>

            <div className="tab-navigation">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
}
