
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { ServiceErrorBoundary } from '@/components/common/ServiceErrorBoundary';

// Lazy load components for better performance
const Login = React.lazy(() => import('@/pages/Login'));
const Authentication = React.lazy(() => import('@/pages/Authentication'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const CustomerPortalLogin = React.lazy(() => import('@/pages/CustomerPortalLogin'));

function App() {
  return (
    <div className="min-h-screen bg-background">
      <ServiceErrorBoundary>
        <Suspense 
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" message="Loading application..." />
            </div>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <AuthErrorBoundary>
                  <Login />
                </AuthErrorBoundary>
              } 
            />
            <Route 
              path="/customer-portal" 
              element={
                <AuthErrorBoundary>
                  <CustomerPortalLogin />
                </AuthErrorBoundary>
              } 
            />
            
            {/* Auth redirect handler */}
            <Route path="/auth" element={<Authentication />} />
            
            {/* Protected routes - these will be handled by individual page components */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </ServiceErrorBoundary>
      
      <Toaster />
    </div>
  );
}

export default App;
