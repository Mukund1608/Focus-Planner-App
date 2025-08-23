import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SuperTokensWrapper } from 'supertokens-auth-react';
import AppLayout from './components/AppLayout';
import LoadingScreen from './components/LoadingScreen';
import Home from './Home';
import Dashboard from './Dashboard';
import DailyView from './components/DailyView';
import WeeklyView from './components/WeeklyView';
import PriorityBoards from './components/PriorityBoards';
import HabitTracker from './components/HabitTracker';
import FocusMode from './components/FocusMode';
import Settings from './components/Settings';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SuperTokensWrapper>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
            <Route
              path="/daily"
              element={
                <AppLayout>
                  <DailyView />
                </AppLayout>
              }
            />
            <Route
              path="/weekly"
              element={
                <AppLayout>
                  <WeeklyView />
                </AppLayout>
              }
            />
            <Route
              path="/priority"
              element={
                <AppLayout>
                  <PriorityBoards />
                </AppLayout>
              }
            />
            <Route
              path="/habits"
              element={
                <AppLayout>
                  <HabitTracker />
                </AppLayout>
              }
            />
            <Route
              path="/focus"
              element={
                <AppLayout>
                  <FocusMode />
                </AppLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AppLayout>
                  <Settings />
                </AppLayout>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </SuperTokensWrapper>
    </ThemeProvider>
  );
}

export default App;
