import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SuperTokensWrapper } from 'supertokens-auth-react';
import { getSuperTokensRoutesForReactRouterDom } from 'supertokens-auth-react/ui';
import * as ReactRouter from 'react-router-dom';
import { PreBuiltUIList } from './config';
import AppLayout from './components/AppLayout';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './Dashboard';
import DailyView from './components/DailyView';
import WeeklyView from './components/WeeklyView';
import PriorityBoards from './components/PriorityBoards';
import HabitTracker from './components/HabitTracker';
import FocusMode from './components/FocusMode';
import Settings from './components/Settings';

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
    return <LoadingScreen />;
  }

  return (
    <SuperTokensWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          {/* SuperTokens Auth Routes */}
          {getSuperTokensRoutesForReactRouterDom(ReactRouter, PreBuiltUIList)}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DailyView />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <WeeklyView />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/priority"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PriorityBoards />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/habits"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HabitTracker />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <FocusMode />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Router>
    </SuperTokensWrapper>
  );
}

export default App;
