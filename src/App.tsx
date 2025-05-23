
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import CustomerPortal from './pages/CustomerPortal';
import DeveloperPortal from './pages/DeveloperPortal';
import ClientBooking from './pages/ClientBooking';
import ServiceManagement from './pages/developer/ServiceManagement';
import ShoppingControls from './pages/developer/ShoppingControls';
import OrganizationManagement from './pages/developer/OrganizationManagement';
import InvoiceCreate from './pages/InvoiceCreate';
import Login from './pages/Login';
import Index from './pages/Index';
import Unauthorized from './pages/Unauthorized';
import { ImpersonationProvider } from './contexts/ImpersonationContext';

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ImpersonationProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Index />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/customer-portal" element={
              <ProtectedRoute>
                <Layout>
                  <CustomerPortal />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/client-booking" element={
              <ProtectedRoute>
                <Layout>
                  <ClientBooking />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/invoice/create" element={
              <ProtectedRoute>
                <Layout>
                  <InvoiceCreate />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin/Developer protected routes */}
            <Route path="/developer" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <DeveloperPortal />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/developer/service-management" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <ServiceManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/developer/shopping-controls" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <ServiceManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/developer/organization-management" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <OrganizationManagement />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ImpersonationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
