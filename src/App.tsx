
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthGate } from '@/components/AuthGate';

// Pages
import Dashboard from '@/pages/Dashboard';
import Authentication from '@/pages/Authentication';
import CustomerPortalLogin from '@/pages/CustomerPortalLogin';
import ServiceManagement from '@/pages/developer/ServiceManagement';

// Create a client
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
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Authentication />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/customer-portal-login" element={<CustomerPortalLogin />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={
              <AuthGate>
                <Layout />
              </AuthGate>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="developer/service-management" element={
                <ProtectedRoute requiredRole="admin">
                  <ServiceManagement />
                </ProtectedRoute>
              } />
              
              {/* Catch all route - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
          <Toaster />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
