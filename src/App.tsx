
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { DatabaseInitializer } from '@/components/database/DatabaseInitializer';
import { useAuthUser } from '@/hooks/useAuthUser';
import WorkOrders from '@/pages/WorkOrders';

function App() {
  const { isAuthenticated, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DatabaseInitializer>
      <AuthErrorBoundary>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<div>Auth page placeholder</div>} />
            
            {/* Protected routes */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
            <Route path="/dashboard" element={isAuthenticated ? <div>Dashboard placeholder</div> : <Navigate to="/auth" replace />} />
            <Route path="/work-orders/*" element={isAuthenticated ? <WorkOrders /> : <Navigate to="/auth" replace />} />
            <Route path="/customers/*" element={isAuthenticated ? <div>Customers placeholder</div> : <Navigate to="/auth" replace />} />
            <Route path="/inventory/*" element={isAuthenticated ? <div>Inventory placeholder</div> : <Navigate to="/auth" replace />} />
            <Route path="/invoices/*" element={isAuthenticated ? <div>Invoices placeholder</div> : <Navigate to="/auth" replace />} />
            <Route path="/settings/*" element={isAuthenticated ? <div>Settings placeholder</div> : <Navigate to="/auth" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} />
          </Routes>
          <Toaster />
        </div>
      </AuthErrorBoundary>
    </DatabaseInitializer>
  );
}

export default App;
