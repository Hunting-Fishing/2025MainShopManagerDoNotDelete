
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

// Import additional pages that need protection
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import CreateCustomer from './pages/CreateCustomer';
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import Inventory from './pages/Inventory';
import Team from './pages/Team';
import Reports from './pages/Reports';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import WorkOrderCreate from './pages/WorkOrderCreate';
import WorkOrderDetails from './pages/WorkOrderDetails';

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
            
            {/* Protected routes - General User Access */}
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

            {/* Customer Management Routes */}
            <Route path="/customers" element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/customers/create" element={
              <ProtectedRoute>
                <Layout>
                  <CreateCustomer />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/customers/:id" element={
              <ProtectedRoute>
                <Layout>
                  <CustomerDetails />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Invoice Routes */}
            <Route path="/invoices" element={
              <ProtectedRoute>
                <Layout>
                  <Invoices />
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

            <Route path="/invoices/:id" element={
              <ProtectedRoute>
                <Layout>
                  <InvoiceDetails />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Work Order Routes */}
            <Route path="/work-orders/create" element={
              <ProtectedRoute>
                <Layout>
                  <WorkOrderCreate />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/work-orders/:id" element={
              <ProtectedRoute>
                <Layout>
                  <WorkOrderDetails />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Inventory Routes */}
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Team Routes */}
            <Route path="/team" element={
              <ProtectedRoute>
                <Layout>
                  <Team />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Reports & Analytics */}
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Calendar & Communication */}
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Layout>
                  <Calendar />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/chat" element={
              <ProtectedRoute>
                <Layout>
                  <Chat />
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
                  <ShoppingControls />
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
