import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Preparing your mission..." 
}) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* Rocket Icon */}
        <div className="rocket-container">
          <div className="rocket">
            <div className="rocket-body">
              <div className="rocket-nose"></div>
              <div className="rocket-window"></div>
              <div className="rocket-fins">
                <div className="fin fin-left"></div>
                <div className="fin fin-right"></div>
              </div>
            </div>
            <div className="rocket-flame">
              <div className="flame flame-1"></div>
              <div className="flame flame-2"></div>
              <div className="flame flame-3"></div>
            </div>
          </div>
        </div>
        
        {/* UpNXT Brand */}
        <div className="brand-lockup">
          <h1 className="text-display text-center text-white mb-4">
            UpNXT
          </h1>
          <p className="text-body-lg text-center text-text-secondary-dark mb-8">
            {message}
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill animate-progress-pulse"></div>
            <div className="shooting-star animate-shooting-star"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
