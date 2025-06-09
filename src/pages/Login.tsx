
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthUser();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // If already authenticated, go to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Check if this is staff login or redirect to home
        if (location.pathname === '/staff-login') {
          // This is the staff login route, show staff login UI
          // For now, redirect to the main authentication page
          navigate('/auth', { replace: true });
        } else {
          // Regular login, redirect to home page
          navigate('/', { replace: true });
        }
      }
    }
  }, [navigate, isAuthenticated, isLoading, location.pathname]);

  // Show loading while determining auth state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
