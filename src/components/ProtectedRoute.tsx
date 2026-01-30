import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '@/lib/admin-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authenticated = isAdminAuthenticated();

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

