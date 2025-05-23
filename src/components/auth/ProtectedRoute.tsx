
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, isAdmin, isOwner } = useAuthUser();
  const location = useLocation();

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole === 'admin' && !isAdmin && !isOwner) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole === 'owner' && !isOwner) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
