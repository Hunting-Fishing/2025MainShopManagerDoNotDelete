import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';

// Authentication
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Auth from '@/pages/Auth';

// Layout
import Layout from '@/components/layout/Layout';

// Pages - Main
import Dashboard from '@/pages/Dashboard';

// Pages - Work Orders (Fixed)
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import WorkOrderEdit from '@/pages/WorkOrderEdit';
import WorkOrderDetails from '@/pages/WorkOrderDetails';

// Pages - Other
import Customers from '@/pages/Customers';
import CustomerCreate from '@/pages/CustomerCreate';
import CustomerDetails from '@/pages/CustomerDetails';
import Inventory from '@/pages/Inventory';
import InventoryCreate from '@/pages/InventoryCreate';
import Invoices from '@/pages/Invoices';
import Calendar from '@/pages/Calendar';
import Equipment from '@/pages/Equipment';
import Maintenance from '@/pages/Maintenance';
import Chat from '@/pages/Chat';
import Documents from '@/pages/Documents';
import Forms from '@/pages/Forms';
import Email from '@/pages/Email';
import Notifications from '@/pages/Notifications';
import Feedback from '@/pages/Feedback';
import Shopping from '@/pages/Shopping';
import Affiliate from '@/pages/Affiliate';
import Settings from '@/pages/Settings';
import Developer from '@/pages/Developer';
import CustomerPortal from '@/pages/CustomerPortal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Authentication Routes */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Work Orders Routes - Fixed */}
                      <Route path="/work-orders/*" element={<WorkOrders />} />
                      <Route path="/work-orders/create" element={<WorkOrderCreate />} />
                      <Route path="/work-orders/:id/edit" element={<WorkOrderEdit />} />
                      <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
                      
                      {/* Customer Routes */}
                      <Route path="/customers/*" element={<Customers />} />
                      <Route path="/customers/create" element={<CustomerCreate />} />
                      <Route path="/customers/:id" element={<CustomerDetails />} />
                      
                      {/* Inventory Routes */}
                      <Route path="/inventory/*" element={<Inventory />} />
                      <Route path="/inventory/add" element={<InventoryCreate />} />
                      
                      {/* Other Routes */}
                      <Route path="/invoices/*" element={<Invoices />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/equipment" element={<Equipment />} />
                      <Route path="/maintenance" element={<Maintenance />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/forms" element={<Forms />} />
                      <Route path="/email" element={<Email />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/feedback" element={<Feedback />} />
                      <Route path="/shopping" element={<Shopping />} />
                      <Route path="/affiliate" element={<Affiliate />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/developer" element={<Developer />} />
                      
                      {/* Customer Portal */}
                      <Route path="/portal/*" element={<CustomerPortal />} />
                      
                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
