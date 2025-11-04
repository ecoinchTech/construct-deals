import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '@/store/slices/authSlice';
import { useGetCurrentUserQuery } from '@/store/api/authApi';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  // Only fetch current user if token exists
  const { data, isLoading, isError } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (!token) {
      // No token, mark as initialized
      setIsInitialized(true);
      dispatch(setLoading(false));
      return;
    }

    if (isLoading) {
      dispatch(setLoading(true));
      return;
    }

    if (data?.success && data.data.user && token && refreshToken) {
      // Set user data in Redux
      dispatch(setCredentials({
        user: data.data.user,
        token,
        refreshToken,
      }));
      dispatch(setLoading(false));
      setIsInitialized(true);
    } else if (isError) {
      // Token invalid, clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      dispatch(setLoading(false));
      setIsInitialized(true);
    }
  }, [data, isLoading, isError, token, refreshToken, dispatch]);

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
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
