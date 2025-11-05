import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCredentials, setLoading, logout } from '@/store/slices/authSlice';
import { useGetCurrentUserQuery } from '@/store/api/authApi';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const { isLoading, user } = useSelector((state: RootState) => state.auth);
  
  // Check for stored tokens on mount
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  // Only fetch current user if token exists but user not loaded
  const { data, isLoading: isQueryLoading, isError } = useGetCurrentUserQuery(undefined, {
    skip: !token || !!user,
  });

  useEffect(() => {
    // If we have tokens but no user, set loading
    if (token && !user && !isError) {
      dispatch(setLoading(true));
    }
  }, [token, user, isError, dispatch]);

  useEffect(() => {
    // Handle successful user data fetch
    if (data?.success && data.data.user && token && refreshToken) {
      dispatch(setCredentials({
        user: data.data.user,
        token,
        refreshToken,
      }));
      dispatch(setLoading(false));
    }
  }, [data, token, refreshToken, dispatch]);

  useEffect(() => {
    // Handle API errors (invalid token)
    if (isError && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      dispatch(logout());
    }
  }, [isError, token, dispatch]);

  useEffect(() => {
    // If no token, make sure we're not loading
    if (!token) {
      dispatch(setLoading(false));
    }
  }, [token, dispatch]);

  // Show loading screen while fetching user data
  if (isLoading || isQueryLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
