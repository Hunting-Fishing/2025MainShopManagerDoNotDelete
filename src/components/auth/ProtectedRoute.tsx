
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { RoleGuard } from './RoleGuard';
import { ShopGuard } from './ShopGuard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { performAuthRecovery } from '@/utils/authCleanup';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
  requireOwner?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  allowedRoles = [],
  requireOwner = false,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isLoading, error } = useAuthUser();
  const location = useLocation();

  // Combine legacy requiredRole with new allowedRoles array
  const finalAllowedRoles = requiredRole ? [...allowedRoles, requiredRole] : allowedRoles;

  console.log('ProtectedRoute - Auth state:', {
    isAuthenticated,
    isLoading,
    error,
    requiredRole,
    allowedRoles: finalAllowedRoles,
    requireOwner,
    requireAdmin,
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

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold">Authentication Error</h2>
            <p className="text-sm text-gray-600">{error}</p>
            <Button onClick={performAuthRecovery} variant="outline">
              Reset Authentication
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <ShopGuard>
      <RoleGuard
        allowedRoles={finalAllowedRoles}
        requireOwner={requireOwner}
        requireAdmin={requireAdmin}
      >
        {children}
      </RoleGuard>
    </ShopGuard>
  );
};
