import React, { useState, useEffect } from 'react';
import PriorityBoards from '../components/PriorityBoards';
import DailyView from '../components/DailyView';
import WeeklyView from '../components/WeeklyView';
import Settings from '../components/Settings';
import FocusMode from '../components/FocusMode';
import './Dashboard.css';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('daily');

    // Load active tab from localStorage on component mount
    useEffect(() => {
        const savedTab = localStorage.getItem('focusboard-active-tab');
        if (savedTab && ['daily', 'weekly', 'priority', 'habits', 'focus', 'settings'].includes(savedTab)) {
            setActiveTab(savedTab);
        }
    }, []);

    // Save active tab to localStorage when it changes
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        localStorage.setItem('focusboard-active-tab', tabId);
    };

    const tabs = [
        { id: 'daily', label: 'Daily', icon: '📅' },
        { id: 'weekly', label: 'Weekly', icon: '📊' },
        { id: 'priority', label: 'Priority Board', icon: '🎯' },
        { id: 'habits', label: 'Habits', icon: '🔄' },
        { id: 'focus', label: 'Focus Mode', icon: '🎧' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'daily':
                return <DailyView />;
            case 'weekly':
                return <WeeklyView />;
            case 'priority':
                return <PriorityBoards />;
            case 'settings':
                return <Settings />;
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
                return <FocusMode />;
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
                        onClick={() => handleTabChange(tab.id)}
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
