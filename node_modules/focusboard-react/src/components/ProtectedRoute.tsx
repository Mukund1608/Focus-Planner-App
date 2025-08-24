import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = useSessionContext();

  if (session.loading) {
    return <div>Loading...</div>;
  }

  if (!session.doesSessionExist) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
