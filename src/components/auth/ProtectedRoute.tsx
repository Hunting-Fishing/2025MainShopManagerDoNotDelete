
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
  const { isAuthenticated, isLoading, isAdmin, isOwner, userId } = useAuthUser();
  const location = useLocation();

  // Debug logging
  console.log('ProtectedRoute - Auth state:', {
    isAuthenticated,
    isLoading,
    isAdmin,
    isOwner,
    userId,
    requiredRole,
    currentPath: location.pathname
  });

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
    console.log('User not authenticated, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole === 'admin' && !isAdmin && !isOwner) {
    console.log('Access denied: User needs admin role but has isAdmin:', isAdmin, 'isOwner:', isOwner);
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === 'owner' && !isOwner) {
    console.log('Access denied: User needs owner role but has isOwner:', isOwner);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Access granted');
  return <>{children}</>;
};
