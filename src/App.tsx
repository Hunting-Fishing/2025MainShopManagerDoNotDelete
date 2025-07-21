import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/layout/Layout';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthGate } from '@/components/AuthGate';

// Pages
import Dashboard from '@/pages/Dashboard';
import Shopping from '@/pages/Shopping';
import ProductDetail from '@/pages/ProductDetail';
import CustomerPortal from '@/pages/CustomerPortal';
import WorkOrders from '@/pages/WorkOrders';
import Customers from '@/pages/Customers';
import Inventory from '@/pages/Inventory';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Calendar from '@/pages/Calendar';
import TeamManagement from '@/pages/TeamManagement';
import Help from '@/pages/Help';
import Login from '@/pages/Login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <CompanyProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <AuthGate>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Store */}
                      <Route path="/shopping" element={<Shopping />} />
                      <Route path="/shopping/:id" element={<ProductDetail />} />
                      <Route path="/customer-portal" element={<CustomerPortal />} />
                      
                      {/* Work Management */}
                      <Route path="/work-orders" element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                          <WorkOrders />
                        </ProtectedRoute>
                      } />
                      
                      {/* Customer Management */}
                      <Route path="/customers" element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                          <Customers />
                        </ProtectedRoute>
                      } />
                      
                      {/* Inventory */}
                      <Route path="/inventory" element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                          <Inventory />
                        </ProtectedRoute>
                      } />
                      
                      {/* Analytics */}
                      <Route path="/analytics" element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                          <Analytics />
                        </ProtectedRoute>
                      } />
                      
                      {/* Settings */}
                      <Route path="/settings" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      
                      {/* Calendar */}
                      <Route path="/calendar" element={<Calendar />} />
                      
                      {/* Team Management */}
                      <Route path="/team" element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                          <TeamManagement />
                        </ProtectedRoute>
                      } />
                      
                      {/* Help & Support */}
                      <Route path="/help" element={<Help />} />
                      
                      {/* Catch all */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </AuthGate>
              }
            />
          </Routes>
        </CompanyProvider>
      </Router>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;