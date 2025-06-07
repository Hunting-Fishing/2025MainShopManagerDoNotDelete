
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function Authentication() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthUser();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // If already authenticated, go to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // If not authenticated, go to login
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, isAuthenticated, isLoading]);

  // Show loading while determining auth state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
