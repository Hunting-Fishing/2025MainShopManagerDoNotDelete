
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-esm-blue-50 to-esm-blue-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-esm-blue-600" />
        <p className="text-esm-blue-600">Checking authentication...</p>
      </div>
    </div>
  );
}
