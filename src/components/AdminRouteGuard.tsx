import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '@/lib/admin-auth';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires auth. If false, redirects if authenticated
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const isAuth = isAdminAuthenticated();
      setAuthenticated(isAuth);
      setIsChecking(false);
    };

    checkAuth();
  }, [location.pathname]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (requireAuth) {
    // Protected route - requires authentication
    if (!authenticated) {
      return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }
    return <>{children}</>;
  } else {
    // Public route (like login) - redirects if already authenticated
    if (authenticated) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <>{children}</>;
  }
};

export default AdminRouteGuard;

