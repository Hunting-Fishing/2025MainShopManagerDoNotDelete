
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4 p-8">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGate;
