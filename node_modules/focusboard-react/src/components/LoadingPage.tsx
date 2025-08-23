import React, { useEffect, useState } from 'react';
import './LoadingPage.css';

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    // Animated entrance sequence
    const entranceTimer = setTimeout(() => setShowLogo(true), 300);
    const titleTimer = setTimeout(() => setShowTitle(true), 800);
    const messageTimer = setTimeout(() => setShowMessage(true), 1200);
    const progressTimer = setTimeout(() => setShowProgress(true), 1600);

    return () => {
      clearTimeout(entranceTimer);
      clearTimeout(titleTimer);
      clearTimeout(messageTimer);
      clearTimeout(progressTimer);
    };
  }, []);

  useEffect(() => {
    if (!showProgress) return;

    // Slower, more engaging loading with pauses
    const loadingStages = [
      { progress: 15, delay: 200 },
      { progress: 30, delay: 300 },
      { progress: 45, delay: 400 },
      { progress: 60, delay: 500 },
      { progress: 75, delay: 600 },
      { progress: 90, delay: 700 },
      { progress: 100, delay: 800 }
    ];

    let currentStage = 0;

    const timer = setInterval(() => {
      if (currentStage < loadingStages.length) {
        const stage = loadingStages[currentStage];
        setProgress(stage.progress);
        currentStage++;
        
        if (stage.progress === 100) {
          clearInterval(timer);
          setTimeout(onLoadingComplete, 1000); // Longer delay for dramatic effect
        }
      }
    }, 1500); // Slower overall pace

    return () => clearInterval(timer);
  }, [showProgress, onLoadingComplete]);

  return (
    <div className="loading-page">
      <div className="loading-background">
        <div className="floating-shapes">
          <div className="shape shape-1">📅</div>
          <div className="shape shape-2">🎯</div>
          <div className="shape shape-3">🔄</div>
          <div className="shape shape-4">🎧</div>
          <div className="shape shape-5">⚡</div>
          <div className="shape shape-6">📊</div>
        </div>
      </div>

      <div className="loading-content">
        <div className={`loading-logo ${showLogo ? 'animate-in' : ''}`}>
          <div className="logo-container">
            <span className="logo-icon">🎯</span>
            <h1 className={`logo-title ${showTitle ? 'animate-in' : ''}`}>
              FocusBoard
            </h1>
          </div>
        </div>
        
        <div className={`loading-message ${showMessage ? 'animate-in' : ''}`}>
          <h2>Organize your tasks, prioritize your work, and build better habits</h2>
        </div>

        <div className={`loading-progress ${showProgress ? 'animate-in' : ''}`}>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {progress < 100 ? `Loading your productivity journey... ${progress}%` : 'Ready to focus! 🚀'}
            </p>
          </div>
        </div>

        <div className="loading-features">
          <div className="feature-highlight">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">Smart Task Management</span>
          </div>
          <div className="feature-highlight">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">Priority-Based Organization</span>
          </div>
          <div className="feature-highlight">
            <span className="feature-icon">🔄</span>
            <span className="feature-text">Habit Building System</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
