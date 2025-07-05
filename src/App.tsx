import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { DatabaseInitializer } from '@/components/database/DatabaseInitializer';
import { Layout } from '@/components/layout/Layout';
import { useAuthUser } from '@/hooks/useAuthUser';
import Dashboard from '@/pages/Dashboard';
import AuthRoutes from '@/pages/AuthRoutes';
import Profile from '@/pages/Profile';
import ServiceCatalog from '@/pages/ServiceCatalog';
import ServiceCategory from '@/pages/ServiceCategory';
import ServiceSubcategory from '@/pages/ServiceSubcategory';
import ServiceJob from '@/pages/ServiceJob';
import WorkOrders from '@/pages/WorkOrders';
import Customers from '@/pages/Customers';
import Inventory from '@/pages/Inventory';
import Invoices from '@/pages/Invoices';
import Calendar from '@/pages/Calendar';
import Quotes from '@/pages/Quotes';
import Team from '@/pages/Team';
import Documents from '@/pages/Documents';
import Settings from '@/pages/Settings';
import CustomerCommunications from '@/pages/CustomerCommunications';
import CallLogger from '@/pages/CallLogger';
import ServiceBoard from '@/pages/ServiceBoard';
import CompanyProfile from '@/pages/CompanyProfile';
import VehiclesPage from '@/pages/VehiclesPage';

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
            
            {/* Protected routes - all wrapped with Layout */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
            <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/profile" element={isAuthenticated ? <Layout><Profile /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Work Orders */}
            <Route path="/work-orders/*" element={isAuthenticated ? <Layout><WorkOrders /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Services */}
            <Route path="/services" element={isAuthenticated ? <Layout><ServiceCatalog /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/services/category/:categoryId" element={isAuthenticated ? <Layout><ServiceCategory /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/services/category/:categoryId/subcategory/:subcategoryId" element={isAuthenticated ? <Layout><ServiceSubcategory /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/services/job/:jobId" element={isAuthenticated ? <Layout><ServiceJob /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Real application routes */}
            <Route path="/customers/*" element={isAuthenticated ? <Layout><Customers /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/inventory/*" element={isAuthenticated ? <Layout><Inventory /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/invoices/*" element={isAuthenticated ? <Layout><Invoices /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/calendar" element={isAuthenticated ? <Layout><Calendar /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/quotes/*" element={isAuthenticated ? <Layout><Quotes /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/team/*" element={isAuthenticated ? <Layout><Team /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/documents" element={isAuthenticated ? <Layout><Documents /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Settings - comprehensive functionality exists */}
            <Route path="/settings/*" element={isAuthenticated ? <Layout><Settings /></Layout> : <Navigate to="/auth" replace />} />
            
            {/* Missing functionality routes */}
            <Route path="/customer-comms" element={isAuthenticated ? <Layout><CustomerCommunications /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/call-logger" element={isAuthenticated ? <Layout><CallLogger /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/service-board" element={isAuthenticated ? <Layout><ServiceBoard /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/company-profile" element={isAuthenticated ? <Layout><CompanyProfile /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/vehicles" element={isAuthenticated ? <Layout><VehiclesPage /></Layout> : <Navigate to="/auth" replace />} />
            <Route path="/service-editor" element={isAuthenticated ? <Navigate to="/services" replace /> : <Navigate to="/auth" replace />} />
            <Route path="/help" element={isAuthenticated ? <Navigate to="/settings" replace /> : <Navigate to="/auth" replace />} />
            <Route path="/security" element={isAuthenticated ? <Navigate to="/settings/security" replace /> : <Navigate to="/auth" replace />} />
            
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
