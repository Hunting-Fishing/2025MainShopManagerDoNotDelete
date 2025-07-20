
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RoleGuard } from './RoleGuard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
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
  const { isAuthenticated, loading, error } = useAuth();
  const location = useLocation();

  // Combine legacy requiredRole with new allowedRoles array
  const finalAllowedRoles = requiredRole ? [...allowedRoles, requiredRole] : allowedRoles;

  console.log('ProtectedRoute - Auth state:', {
    isAuthenticated,
    loading,
    error,
    requiredRole,
    allowedRoles: finalAllowedRoles,
    requireOwner,
    requireAdmin,
    currentPath: location.pathname
  });

  if (loading) {
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
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">Authentication Error</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <RoleGuard
      allowedRoles={finalAllowedRoles}
      requireOwner={requireOwner}
      requireAdmin={requireAdmin}
    >
      {children || <Outlet />}
    </RoleGuard>
  );
};
