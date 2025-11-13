import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { UserRole } from '@/types/auth.types';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for token in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !isAuthenticated) {
      setIsCheckingAuth(false);
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated]);

  // Show loading while checking authentication
  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Check if user is authenticated (either from Redux or localStorage)
  const token = localStorage.getItem('token');
  const hasAuth = isAuthenticated || !!token;

  if (!hasAuth) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;