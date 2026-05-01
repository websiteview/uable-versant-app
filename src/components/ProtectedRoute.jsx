import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  // Security: Never render protected content before session validation completes.
  // This prevents UI flashing or brief exposure of sensitive layouts.
  if (isAuthLoading) {
    return <LoadingScreen message="Validating secure session..." />;
  }

  if (!isAuthenticated) {
    // Security: Use replace to prevent adding the login page to the history stack.
    // This ensures that when a user logs in, pressing back doesn't take them to the login form.
    return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/teacher/login'} replace />;
  }

  if (user?.role !== requiredRole) {
    // Security: Use replace for unauthorized role redirects as well.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;