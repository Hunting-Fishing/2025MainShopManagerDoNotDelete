import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';

// Authentication - Using existing components
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';

// Layout - Using existing component
import { Layout } from '@/components/layout/Layout';

// Pages - Main
import Dashboard from '@/pages/Dashboard';

// Pages - Work Orders (Fixed)
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderCreate from '@/pages/WorkOrderCreate';
import WorkOrderEdit from '@/pages/WorkOrderEdit';

// Pages - Other existing pages
import Customers from '@/pages/Customers';
import Inventory from '@/pages/Inventory';
import Invoices from '@/pages/Invoices';
import Settings from '@/pages/Settings';

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
        <BrowserRouter>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            
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
                    
                    {/* Other existing routes */}
                    <Route path="/customers/*" element={<Customers />} />
                    <Route path="/inventory/*" element={<Inventory />} />
                    <Route path="/invoices/*" element={<Invoices />} />
                    <Route path="/settings/*" element={<Settings />} />
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
