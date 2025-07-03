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
            
            {/* Real application routes */}
            <Route path="/customers/*" element={isAuthenticated ? <Customers /> : <Navigate to="/auth" replace />} />
            <Route path="/inventory/*" element={isAuthenticated ? <Inventory /> : <Navigate to="/auth" replace />} />
            <Route path="/invoices/*" element={isAuthenticated ? <Invoices /> : <Navigate to="/auth" replace />} />
            <Route path="/calendar" element={isAuthenticated ? <Calendar /> : <Navigate to="/auth" replace />} />
            <Route path="/quotes/*" element={isAuthenticated ? <Quotes /> : <Navigate to="/auth" replace />} />
            <Route path="/team/*" element={isAuthenticated ? <Team /> : <Navigate to="/auth" replace />} />
            <Route path="/documents" element={isAuthenticated ? <Documents /> : <Navigate to="/auth" replace />} />
            
            {/* Settings - comprehensive functionality exists */}
            <Route path="/settings/*" element={isAuthenticated ? <Settings /> : <Navigate to="/auth" replace />} />
            
            {/* Missing functionality routes */}
            <Route path="/customer-comms" element={isAuthenticated ? <CustomerCommunications /> : <Navigate to="/auth" replace />} />
            <Route path="/call-logger" element={isAuthenticated ? <CallLogger /> : <Navigate to="/auth" replace />} />
            <Route path="/service-board" element={isAuthenticated ? <ServiceBoard /> : <Navigate to="/auth" replace />} />
            <Route path="/company-profile" element={isAuthenticated ? <CompanyProfile /> : <Navigate to="/auth" replace />} />
            <Route path="/vehicles" element={isAuthenticated ? <VehiclesPage /> : <Navigate to="/auth" replace />} />
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
