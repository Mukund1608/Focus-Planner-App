import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SuperTokensWrapper } from 'supertokens-auth-react';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { getSuperTokensRoutesForReactRouterDom } from 'supertokens-auth-react/ui';
import * as ReactRouter from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './Dashboard';
import DailyView from './components/DailyView';
import WeeklyView from './components/WeeklyView';
import PriorityBoards from './components/PriorityBoards';
import HabitTracker from './components/HabitTracker';
import FocusMode from './components/FocusMode';
import Settings from './components/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import { PreBuiltUIList } from './config';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const session = useSessionContext();

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
    <Router>
      <Routes>
        {/* Auth routes */}
        {getSuperTokensRoutesForReactRouterDom(ReactRouter, PreBuiltUIList)}
        
        {/* Protected routes - redirect to auth if not logged in */}
        <Route
          path="/dashboard"
          element={
            session.doesSessionExist ? (
              <AppLayout>
                <Dashboard />
              </AppLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/daily"
          element={
            session.doesSessionExist ? (
              <AppLayout>
                <DailyView />
              </AppLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/weekly"
          element={
            session.doesSessionExist ? (
              <AppLayout>
                <WeeklyView />
              </AppLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/priority"
          element={
            session.doesSessionExist ? (
              <AppLayout>
                <PriorityBoards />
              </AppLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/habits"
          element={
            session.doesSessionExist ? (
              <AppLayout>
                <HabitTracker />
              </AppLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/focus"
          element={
            session.doesSessionExist ? (
              <AppLayout>
                <FocusMode />
              </AppLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            session.doesSessionExist ? (
              <AppLayout>
                <Settings />
              </AppLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        
        {/* Root redirect - if logged in go to dashboard, otherwise to auth */}
        <Route 
          path="/" 
          element={
            session.doesSessionExist ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        {/* Catch all other routes */}
        <Route 
          path="*" 
          element={
            session.doesSessionExist ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SuperTokensWrapper>
        <AppContent />
      </SuperTokensWrapper>
    </ThemeProvider>
  );
}

export default App;
