import React from 'react';
import DailyView from '../components/DailyView';
import './Dashboard.css';

export default function Dashboard() {
    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Daily View</h1>
                <p>Plan your day and track your progress</p>
            </div>

            <div className="dashboard-content">
                <DailyView />
            </div>
        </div>
    );
}
