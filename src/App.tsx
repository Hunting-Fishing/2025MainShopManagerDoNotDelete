import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { DatabaseInitializer } from '@/components/database/DatabaseInitializer';
import { useAuthUser } from '@/hooks/useAuthUser';
import Dashboard from '@/pages/Dashboard';
import AuthRoutes from '@/pages/AuthRoutes';
import Profile from '@/pages/Profile';
import ServiceCatalog from '@/pages/ServiceCatalog';
import ServiceCategory from '@/pages/ServiceCategory';
import ServiceSubcategory from '@/pages/ServiceSubcategory';
import ServiceJob from '@/pages/ServiceJob';
import WorkOrders from '@/pages/WorkOrders';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';

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
            <Route path="/auth/*" element={<AuthRoutes />} />
            
            {/* Protected routes */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/auth" replace />} />
            
            {/* Work Orders */}
            <Route path="/work-orders/*" element={isAuthenticated ? <WorkOrders /> : <Navigate to="/auth" replace />} />
            
            {/* Services */}
            <Route path="/services" element={isAuthenticated ? <ServiceCatalog /> : <Navigate to="/auth" replace />} />
            <Route path="/services/category/:categoryId" element={isAuthenticated ? <ServiceCategory /> : <Navigate to="/auth" replace />} />
            <Route path="/services/category/:categoryId/subcategory/:subcategoryId" element={isAuthenticated ? <ServiceSubcategory /> : <Navigate to="/auth" replace />} />
            <Route path="/services/job/:jobId" element={isAuthenticated ? <ServiceJob /> : <Navigate to="/auth" replace />} />
            
            {/* Other protected routes with proper components */}
            <Route path="/customers/*" element={isAuthenticated ? <PlaceholderPage title="Customers" description="Customer management functionality" /> : <Navigate to="/auth" replace />} />
            <Route path="/inventory/*" element={isAuthenticated ? <PlaceholderPage title="Inventory" description="Inventory management functionality" /> : <Navigate to="/auth" replace />} />
            <Route path="/invoices/*" element={isAuthenticated ? <PlaceholderPage title="Invoices" description="Invoice management functionality" /> : <Navigate to="/auth" replace />} />
            <Route path="/settings/*" element={isAuthenticated ? <PlaceholderPage title="Settings" description="Application settings" /> : <Navigate to="/auth" replace />} />
            
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
